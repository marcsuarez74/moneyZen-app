import { Component, input, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export interface StrategyCard {
  value: number;
  label: string;
  isPrimary: boolean;
}

export interface StrategyDetail {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-plan-strategy-section',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule, MatCardModule],
  templateUrl: './plan-strategy-section.component.html',
  styleUrls: ['./plan-strategy-section.component.scss'],
})
export class PlanStrategySectionComponent {
  readonly title = input<string>('Stratégie recommandée');
  readonly primaryCard = input<StrategyCard | null>(null);
  readonly details = input<StrategyDetail[]>([]);
  readonly isFeasible = input<boolean>(true);
  readonly feasibilityText = input<string>('');
  readonly hasConstraints = input<boolean>(false);
  readonly constraintText = input<string>('');
}
