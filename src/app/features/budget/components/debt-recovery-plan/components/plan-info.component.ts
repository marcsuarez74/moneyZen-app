import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RecoveryPlanInfo } from '../debt-recovery-plan.component';

@Component({
  selector: 'app-plan-info',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './plan-info.component.html',
  styleUrls: ['./plan-info.component.scss'],
})
export class PlanInfoComponent {
  planInfo = input.required<RecoveryPlanInfo>();
}
