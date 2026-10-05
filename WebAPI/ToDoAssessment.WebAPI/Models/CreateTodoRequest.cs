using System.ComponentModel.DataAnnotations;

namespace ToDoAssessment.WebAPI.Models;

public sealed record CreateTodoRequest([Required, StringLength(200)] string Title);