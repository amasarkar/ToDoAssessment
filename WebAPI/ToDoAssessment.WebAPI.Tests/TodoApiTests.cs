using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using ToDoAssessment.WebAPI.Models;

namespace ToDoAssessment.WebAPI.Tests;

public class TodoApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    // Each test gets its own client; a fresh factory per test keeps the in-memory store isolated.
    private HttpClient CreateClient() =>
        factory.WithWebHostBuilder(_ => { }).CreateClient();

    [Fact]
    public async Task Post_CreatesItem_AndGetReturnsIt()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("Buy milk"));
        var created = await response.Content.ReadFromJsonAsync<TodoItem>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("Buy milk", created!.Title);

        var items = await client.GetFromJsonAsync<List<TodoItem>>("/api/todos");
        Assert.Contains(items!, i => i.Id == created.Id);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Post_ReturnsBadRequest_WhenTitleIsBlank(string title)
    {
        var response = await CreateClient().PostAsJsonAsync("/api/todos", new CreateTodoRequest(title));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_ReturnsBadRequest_WhenTitleIsTooLong()
    {
        var response = await CreateClient().PostAsJsonAsync(
            "/api/todos", new CreateTodoRequest(new string('a', 201)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Delete_RemovesItem()
    {
        var client = CreateClient();
        var created = await (await client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("Buy milk")))
            .Content.ReadFromJsonAsync<TodoItem>();

        var response = await client.DeleteAsync($"/api/todos/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var items = await client.GetFromJsonAsync<List<TodoItem>>("/api/todos");
        Assert.DoesNotContain(items!, i => i.Id == created.Id);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenItemDoesNotExist()
    {
        var response = await CreateClient().DeleteAsync($"/api/todos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}