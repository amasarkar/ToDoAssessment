using ToDoAssessment.WebAPI.Models;

namespace ToDoAssessment.WebAPI.Services;

/// <summary>
/// Stores todo items in memory. Registered as a singleton, so access is guarded by a lock.
/// </summary>
public sealed class InMemoryTodoService(TimeProvider timeProvider) : ITodoService
{
    private readonly List<TodoItem> _items = [];
    private readonly Lock _gate = new();

    public IReadOnlyList<TodoItem> GetAll()
    {
        lock (_gate)
        {
            return _items.ToList();
        }
    }

    public TodoItem Add(string title)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        var item = new TodoItem(Guid.NewGuid(), title.Trim(), timeProvider.GetUtcNow());

        lock (_gate)
        {
            _items.Add(item);
        }

        return item;
    }

    public bool Remove(Guid id)
    {
        lock (_gate)
        {
            return _items.RemoveAll(i => i.Id == id) > 0;
        }
    }
}