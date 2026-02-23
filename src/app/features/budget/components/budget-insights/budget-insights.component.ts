import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FinancialInsight } from '../../../../services/budget-advisor.service';

@Component({
  selector: 'app-budget-insights',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './budget-insights.component.html',
  styleUrls: ['./budget-insights.component.scss']
})
export class BudgetInsightsComponent {
  readonly insights = input.required<FinancialInsight[]>();
  readonly actionClicked = output<FinancialInsight>();
  
  protected getPriorityLabel(priority: number): string {
    if (priority >= 9) return 'Critique';
    if (priority >= 7) return 'Important';
    if (priority >= 5) return 'Conseillé';
    return 'Info';
  }
}