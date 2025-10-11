import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss'
})
export class MetricCard {
  // Signal inputs following Angular 20 best practices
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input<string>('');
  variant = input<'default' | 'primary' | 'success' | 'warning'>('default');
}
