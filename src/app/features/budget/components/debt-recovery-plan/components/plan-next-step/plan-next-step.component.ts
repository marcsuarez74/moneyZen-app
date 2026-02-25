import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RecoveryPlanInfo } from '../../debt-recovery-plan.component';

@Component({
  selector: 'app-plan-next-step',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  templateUrl: './plan-next-step.component.html',
  styleUrls: ['./plan-next-step.component.scss'],
})
export class PlanNextStepComponent {
  planInfo = input.required<RecoveryPlanInfo>();
  recommendedDailyBudget = input.required<number>();
}
