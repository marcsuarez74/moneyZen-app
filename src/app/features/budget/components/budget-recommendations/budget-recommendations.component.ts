import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BudgetSummary, EXPENSE_CATEGORIES, Recommendation } from '../../../../models/budget.model';
import { BudgetAnalysis } from '../../../../services/budget-advisor.service';

@Component({
  selector: 'app-budget-recommendations',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe],
  templateUrl: './budget-recommendations.component.html',
  styleUrls: ['./budget-recommendations.component.scss']
})
export class BudgetRecommendationsComponent {
  readonly analysis = input<BudgetAnalysis | null>(null);
  readonly summary = input<BudgetSummary | null>(null);
  
  readonly applyRecommendation = output<Recommendation>();
  readonly viewDetails = output<Recommendation>();
  
  protected highPriorityRecs = () => 
    this.analysis()?.recommendations?.filter(r => r.priority === 'high') || [];
  
  protected mediumPriorityRecs = () => 
    this.analysis()?.recommendations?.filter(r => r.priority === 'medium') || [];
  
  protected getRecIcon(type: string): string {
    const icons: Record<string, string> = {
      'reduce': 'trending_down',
      'eliminate': 'delete',
      'optimize': 'sync',
      'suggestion': 'lightbulb'
    };
    return icons[type] || 'info';
  }
  
  protected getCategoryLabel(category: string): string {
    const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
    return cat?.label || category;
  }
}