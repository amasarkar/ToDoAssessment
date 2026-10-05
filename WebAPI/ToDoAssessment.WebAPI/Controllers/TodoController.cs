using Microsoft.AspNetCore.Mvc;
using ToDoAssessment.WebAPI.Models;
using ToDoAssessment.WebAPI.Services;

namespace ToDoAssessment.WebAPI.Controllers;

[ApiController]
[Route("api/todos")]
public class TodoController(ITodoService todoService) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<TodoItem>> GetAll() => Ok(todoService.GetAll());

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<TodoItem> Create(CreateTodoRequest request)
    {
        var item = todoService.Add(request.Title);
        return Created($"/api/todos/{item.Id}", item);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(Guid id) => todoService.Remove(id) ? NoContent() : NotFound();
}