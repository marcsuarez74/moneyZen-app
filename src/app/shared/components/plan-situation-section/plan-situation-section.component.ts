import { Component, input, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface SituationMetric {
  icon: string;
  label: string;
  value: number;
  currency?: boolean;
  subtitle?: string;
  progress?: number;
  isNegative?: boolean;
}

@Component({
  selector: 'app-plan-situation-section',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule, MatCardModule, MatProgressBarModule],
  templateUrl: './plan-situation-section.component.html',
  styleUrls: ['./plan-situation-section.component.scss'],
})
export class PlanSituationSectionComponent {
  readonly title = input<string>('Votre situation actuelle');
  readonly metrics = input<SituationMetric[]>([]);
}
