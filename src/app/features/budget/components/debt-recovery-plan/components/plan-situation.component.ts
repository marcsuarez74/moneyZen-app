import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecoveryPlanData } from '../debt-recovery-plan.component';

@Component({
  selector: 'app-plan-situation',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, CurrencyPipe],
  templateUrl: './plan-situation.component.html',
  styleUrls: ['./plan-situation.component.scss'],
})
export class PlanSituationComponent {
  data = input.required<RecoveryPlanData>();
}
