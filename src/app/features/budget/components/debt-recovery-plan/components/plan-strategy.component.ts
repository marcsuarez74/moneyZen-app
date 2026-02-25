import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-plan-strategy',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  templateUrl: './plan-strategy.component.html',
  styleUrls: ['./plan-strategy.component.scss'],
})
export class PlanStrategyComponent {
  recommendedMonthlyBudget = input.required<number>();
  recommendedDailyBudget = input.required<number>();
  minimumRecoveryPerMonth = input.required<number>();
  targetMonths = input.required<number>();
  currentMonthExpenses = input.required<number>();
  adjustedMonthlyBudget = input.required<number>();
  adjustedDailyBudget = input.required<number>();
  daysInMonth = input.required<number>();
}
