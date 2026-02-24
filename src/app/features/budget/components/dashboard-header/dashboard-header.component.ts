import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaydayInfo } from '../../../../services/payday-calculator.service';
import { BackupExportButtonComponent } from '../../../../shared/components/backup-export-button/backup-export-button.component';

interface ChargesInfo {
  count: number;
  total: number;
}

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, BackupExportButtonComponent],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  readonly hasUserData = input.required<boolean>();
  readonly isNegativeBalance = input<boolean>(false);
  readonly paydayInfo = input<PaydayInfo | null>(null);
  readonly paydayMessage = input<string>('');
  readonly upcomingCharges = input<ChargesInfo | null>(null);
  readonly expenseCount = input<number>(0);
  readonly budgetHealth = input<number | undefined>(undefined);
  
  readonly editIncome = output<void>();
  readonly editExpenses = output<void>();
  readonly createNewBudget = output<void>();
  readonly importBank = output<void>();

  getHealthClass(): string {
    const health = this.budgetHealth() || 0;
    if (health >= 70) return 'healthy';
    if (health >= 50) return 'warning';
    return 'critical';
  }

  getHealthIcon(): string {
    const health = this.budgetHealth() || 0;
    if (health >= 70) return 'sentiment_satisfied';
    if (health >= 50) return 'sentiment_neutral';
    return 'sentiment_dissatisfied';
  }
}