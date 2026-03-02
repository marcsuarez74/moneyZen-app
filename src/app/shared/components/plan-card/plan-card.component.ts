import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PlanNavigationComponent, PlanSection } from '../plan-navigation/plan-navigation.component';

export type PlanType = 'debt' | 'savings' | 'investment';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, PlanNavigationComponent],
  templateUrl: './plan-card.component.html',
  styleUrls: ['./plan-card.component.scss'],
})
export class PlanCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly icon = input.required<string>();
  readonly planType = input<PlanType>('debt');
  readonly sections = input<PlanSection[]>([]);
  readonly showNavigation = input<boolean>(true);

  readonly adoptPlan = output<void>();
  readonly adjustPlan = output<void>();

  get headerClass(): string {
    return `header-icon ${this.planType()}`;
  }

  onAdoptPlan(): void {
    this.adoptPlan.emit();
  }

  onAdjustPlan(): void {
    this.adjustPlan.emit();
  }
}
