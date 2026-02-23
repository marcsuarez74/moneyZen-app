import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaydayInfo } from '../../../../services/payday-calculator.service';

interface ChargesInfo {
  count: number;
  total: number;
}

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule],
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
}
