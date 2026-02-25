import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaydayInfo } from '../../../services/payday-calculator.service';

@Component({
  selector: 'app-daily-budget-info',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule, MatTooltipModule],
  templateUrl: './daily-budget-info.component.html',
  styleUrl: './daily-budget-info.component.scss',
})
export class DailyBudgetInfoComponent {
  readonly paydayInfo = input<PaydayInfo | null>(null);

  getUrgencyClass(): string {
    const info = this.paydayInfo();
    if (!info) return '';

    if (info.daysUntilPayday <= 3) return 'urgent';
    if (info.daysUntilPayday <= 7) return 'warning';
    return 'normal';
  }

  getBudgetStatusClass(): string {
    const info = this.paydayInfo();
    if (!info) return '';

    if (info.realisticDailyBudget < 15) return 'critical';
    if (info.realisticDailyBudget < 30) return 'tight';
    return 'good';
  }

  getPaydayLabel(): string {
    const info = this.paydayInfo();
    if (!info) return '';

    if (info.daysUntilPayday === 0) return "Aujourd'hui !";
    if (info.daysUntilPayday === 1) return 'Demain';
    return `${info.daysUntilPayday}j`;
  }

  getTooltipText(): string {
    const info = this.paydayInfo();
    if (!info) return '';

    const days = info.daysUntilPayday;
    const budget = info.realisticDailyBudget;

    if (days === 0) {
      return `Jour de paie ! Budget disponible: ${budget.toFixed(0)}€/jour`;
    }

    return `${days} jour${days > 1 ? 's' : ''} avant la paie • ${budget.toFixed(0)}€/jour disponible`;
  }
}
