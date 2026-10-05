using ToDoAssessment.WebAPI.Services;

namespace ToDoAssessment.WebAPI.Tests;

public class InMemoryTodoServiceTests
{
    private readonly InMemoryTodoService _sut = new(TimeProvider.System);

    [Fact]
    public void GetAll_ReturnsEmpty_WhenNothingAdded()
    {
        Assert.Empty(_sut.GetAll());
    }

    [Fact]
    public void Add_StoresTrimmedTitle()
    {
        var item = _sut.Add("  Buy milk  ");

        Assert.Equal("Buy milk", item.Title);
        Assert.NotEqual(Guid.Empty, item.Id);
        Assert.Single(_sut.GetAll());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Add_Throws_WhenTitleIsBlank(string title)
    {
        Assert.Throws<ArgumentException>(() => _sut.Add(title));
    }

    [Fact]
    public void GetAll_PreservesInsertionOrder()
    {
        _sut.Add("first");
        _sut.Add("second");

        Assert.Equal(["first", "second"], _sut.GetAll().Select(i => i.Title));
    }

    [Fact]
    public void Remove_DeletesExistingItem()
    {
        var item = _sut.Add("Buy milk");

        Assert.True(_sut.Remove(item.Id));
        Assert.Empty(_sut.GetAll());
    }

    [Fact]
    public void Remove_ReturnsFalse_WhenItemDoesNotExist()
    {
        Assert.False(_sut.Remove(Guid.NewGuid()));
    }
}