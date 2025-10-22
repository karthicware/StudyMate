import { Injectable, signal } from '@angular/core';

/**
 * Toast Message Interface
 */
export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

/**
 * ToastService
 *
 * Provides toast notification functionality throughout the application.
 * Uses Angular Signals for reactive state management.
 * Auto-dismisses messages after specified duration (default: 4000ms).
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = signal<ToastMessage[]>([]);
  private nextId = 0;

  /**
   * Public readonly signal for toast messages
   */
  readonly messages = this.toasts.asReadonly();

  /**
   * Display a success toast message
   * @param message - Message to display
   * @param duration - Duration in milliseconds (default: 4000)
   */
  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Display an error toast message
   * @param message - Message to display
   * @param duration - Duration in milliseconds (default: 4000)
   */
  error(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Display an info toast message
   * @param message - Message to display
   * @param duration - Duration in milliseconds (default: 4000)
   */
  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Display a warning toast message
   * @param message - Message to display
   * @param duration - Duration in milliseconds (default: 4000)
   */
  warning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show a toast message
   * @param message - Message to display
   * @param type - Toast type
   * @param duration - Duration in milliseconds
   */
  private show(message: string, type: ToastMessage['type'], duration: number): void {
    const toast: ToastMessage = {
      id: this.nextId++,
      message,
      type,
      duration,
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    // Auto-dismiss after duration
    setTimeout(() => {
      this.dismiss(toast.id);
    }, duration);
  }

  /**
   * Dismiss a specific toast by ID
   * @param id - Toast ID to dismiss
   */
  dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toasts.set([]);
  }
}
