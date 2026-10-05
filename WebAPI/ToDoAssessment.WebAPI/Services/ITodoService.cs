using ToDoAssessment.WebAPI.Models;

namespace ToDoAssessment.WebAPI.Services;

public interface ITodoService
{
    IReadOnlyList<TodoItem> GetAll();

    TodoItem Add(string title);

    bool Remove(Guid id);
}