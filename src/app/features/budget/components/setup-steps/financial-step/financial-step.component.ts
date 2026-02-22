import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormCardComponent } from '../../../../../shared/components/form-card/form-card.component';

@Component({
  selector: 'app-financial-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    FormCardComponent
  ],
  templateUrl: './financial-step.component.html',
  styleUrls: ['./financial-step.component.scss']
})
export class FinancialStepComponent {
  readonly form = input.required<FormGroup>();
  readonly isOverdrawn = input<boolean>(false);
  
  readonly nextStep = output<void>();

  onNext(): void {
    if (this.form().valid) {
      this.nextStep.emit();
    }
  }
}
