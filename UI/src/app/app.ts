import { Component } from '@angular/core';
import { TodoList } from './features/todo-list/todo-list';

@Component({
  selector: 'app-root',
  imports: [TodoList],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
