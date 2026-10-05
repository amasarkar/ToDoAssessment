import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo-item';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/todos';

  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.url);
  }

  add(title: string): Observable<Todo> {
    return this.http.post<Todo>(this.url, { title });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}