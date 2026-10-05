import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Todo } from '../models/todo-item';
import { TodoService } from './todo-service';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the list of todos', () => {
    const expected: Todo[] = [{ id: '1', title: 'Buy milk', createdAt: new Date().toISOString() }];

    service.getAll().subscribe((todos) => {
      expect(todos).toEqual(expected);
    });

    const req = httpMock.expectOne('/api/todos');
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });

  it('posts a new todo with the trimmed title', () => {
    const created: Todo = { id: '2', title: 'Walk the dog', createdAt: new Date().toISOString() };

    service.add('Walk the dog').subscribe((todo) => {
      expect(todo).toEqual(created);
    });

    const req = httpMock.expectOne('/api/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Walk the dog' });
    req.flush(created);
  });

  it('deletes a todo by id', () => {
    service.remove('2').subscribe();

    const req = httpMock.expectOne('/api/todos/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
