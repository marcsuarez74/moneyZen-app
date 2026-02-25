import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaydayInfo } from '../../../../services/payday-calculator.service';
import { BackupService } from '../../../../services/backup.service';
import { DailyBudgetInfoComponent } from '../../../../shared/components/daily-budget-info/daily-budget-info.component';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DailyBudgetInfoComponent,
  ],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss',
})
export class DashboardHeaderComponent {
  readonly hasUserData = input.required<boolean>();
  readonly isNegativeBalance = input<boolean>(false);
  readonly paydayInfo = input<PaydayInfo | null>(null);
  readonly expenseCount = input<number>(0);

  readonly editIncome = output<void>();
  readonly editExpenses = output<void>();
  readonly createNewBudget = output<void>();
  readonly importBank = output<void>();

  readonly isMenuOpen = signal(false);

  private backupService = inject(BackupService);

  async exportBackup(): Promise<void> {
    await this.backupService.exportToZip();
  }
}
