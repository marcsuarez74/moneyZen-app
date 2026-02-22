import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface Step {
  label: string;
  icon: string;
  completed: boolean;
}

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './step-indicator.component.html',
  styleUrls: ['./step-indicator.component.scss']
})
export class StepIndicatorComponent {
  readonly steps = input.required<Step[]>();
  readonly currentStep = input.required<number>();
  readonly stepChange = output<number>();

  onStepClick(index: number): void {
    if (index < this.currentStep()) {
      this.stepChange.emit(index + 1);
    }
  }
}
