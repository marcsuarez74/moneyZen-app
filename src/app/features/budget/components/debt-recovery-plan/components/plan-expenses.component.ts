import { Component, input, output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { QuickExpenseComponent } from '../../quick-expense/quick-expense.component';
import { RecentExpensesComponent } from '../../recent-expenses/recent-expenses.component';

@Component({
  selector: 'app-plan-expenses',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    QuickExpenseComponent,
    RecentExpensesComponent,
  ],
  templateUrl: './plan-expenses.component.html',
  styleUrls: ['./plan-expenses.component.scss'],
})
export class PlanExpensesComponent {
  @ViewChild('recentExpenses', { read: ElementRef }) recentExpenses!: ElementRef;

  recommendedMonthlyBudget = input.required<number>();
  recommendedDailyBudget = input.required<number>();
  paydayDay = input.required<number>();
  viewAllExpensesClicked = output<void>();

  scrollToRecentExpenses(): void {
    this.recentExpenses?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.viewAllExpensesClicked.emit();
  }
}
