import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './components/navigation/navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule, NavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('todo-list-frontend');

  constructor(private router: Router) { }

  shouldShowNavigation(): boolean {
    return this.router.url !== '/' && this.router.url !== '';
  }
}
