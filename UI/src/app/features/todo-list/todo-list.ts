import { Component, inject, OnInit, signal } from '@angular/core';
import { TodoService } from '../../core/services/todo-service';
import { Todo } from '../../core/models/todo-item';

const TITLE_MAX_LENGTH = 200;

@Component({
  selector: 'app-todo-list',
  standalone: true,
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
})
export class TodoList implements OnInit {
  private readonly todoService = inject(TodoService);

  protected readonly titleMaxLength = TITLE_MAX_LENGTH;

  protected readonly todos = signal<Todo[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingDeleteIds = signal<ReadonlySet<string>>(new Set());

  ngOnInit(): void {
    this.loadTodos();
  }

  private loadTodos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.todoService.getAll().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your todos. Please try again.');
        this.loading.set(false);
      },
    });
  }

  addTodo(titleInput: HTMLInputElement): void {
    const title = titleInput.value.trim();
    if (!title || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.todoService.add(title).subscribe({
      next: (todo) => {
        this.todos.update((current) => [...current, todo]);
        titleInput.value = '';
        this.saving.set(false);
      },
      error: () => {
        this.error.set('Could not add that item. Please try again.');
        this.saving.set(false);
      },
    });
  }

  deleteTodo(id: string): void {
    this.pendingDeleteIds.update((ids) => new Set(ids).add(id));
    this.error.set(null);

    this.todoService.remove(id).subscribe({
      next: () => {
        this.todos.update((current) => current.filter((todo) => todo.id !== id));
        this.clearPendingDelete(id);
      },
      error: () => {
        this.error.set('Could not delete that item. Please try again.');
        this.clearPendingDelete(id);
      },
    });
  }

  protected isDeleting(id: string): boolean {
    return this.pendingDeleteIds().has(id);
  }

  private clearPendingDelete(id: string): void {
    this.pendingDeleteIds.update((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
  }
}
