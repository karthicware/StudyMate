import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './store/auth/auth.store';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('studymate-frontend');
  protected readonly authStore = inject(AuthStore);

  testLogin() {
    this.authStore.setUser({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'OWNER',
    });
  }

  testLogout() {
    this.authStore.logout();
  }
}
