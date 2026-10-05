import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Todo } from '../../core/models/todo-item';
import { TodoList } from './todo-list';

describe('TodoList', () => {
  let fixture: ComponentFixture<TodoList>;
  let httpMock: HttpTestingController;

  const seed: Todo[] = [
    { id: '1', title: 'Buy milk', createdAt: '2024-01-01T00:00:00Z' },
    { id: '2', title: 'Walk the dog', createdAt: '2024-01-02T00:00:00Z' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoList);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushInitialLoad(todos: Todo[] = seed) {
    fixture.detectChanges();
    httpMock.expectOne('/api/todos').flush(todos);
    fixture.detectChanges();
  }

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function setTitleAndSubmit(title: string) {
    const input = root().querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = title;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    root()
      .querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('shows a loading message while the initial request is pending', () => {
    fixture.detectChanges();

    expect(root().textContent).toContain('Loading your todos');

    httpMock.expectOne('/api/todos').flush([]);
  });

  it('renders the todos returned by the API', () => {
    flushInitialLoad();

    const items = root().querySelectorAll('.todo-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Buy milk');
    expect(items[1].textContent).toContain('Walk the dog');
  });

  it('shows an empty state when there are no todos', () => {
    flushInitialLoad([]);

    expect(root().textContent).toContain('Nothing to do yet');
  });

  it('shows an error message when loading fails', () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/todos').flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(root().textContent).toContain('Could not load your todos');
  });

  it('adds a new todo and appends it to the list', () => {
    flushInitialLoad([]);

    setTitleAndSubmit('Finish assessment');

    const req = httpMock.expectOne('/api/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Finish assessment' });

    req.flush({ id: '3', title: 'Finish assessment', createdAt: '2024-01-03T00:00:00Z' });
    fixture.detectChanges();

    const items = root().querySelectorAll('.todo-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Finish assessment');

    const input = root().querySelector<HTMLInputElement>('input[name="title"]')!;
    expect(input.value).toBe('');
  });

  it('does not submit when the title is blank or only whitespace', () => {
    flushInitialLoad([]);

    setTitleAndSubmit('   ');

    httpMock.expectNone('/api/todos');
  });

  it('removes a todo once the delete request succeeds', () => {
    flushInitialLoad();

    const deleteButtons = root().querySelectorAll<HTMLButtonElement>('.delete-button');
    deleteButtons[0].click();

    const req = httpMock.expectOne('/api/todos/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    fixture.detectChanges();

    const items = root().querySelectorAll('.todo-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Walk the dog');
  });

  it('keeps the item and shows an error when delete fails', () => {
    flushInitialLoad();

    root().querySelectorAll<HTMLButtonElement>('.delete-button')[0].click();
    httpMock.expectOne('/api/todos/1').flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const items = root().querySelectorAll('.todo-item');
    expect(items.length).toBe(2);
    expect(root().textContent).toContain('Could not delete that item');
  });
});
