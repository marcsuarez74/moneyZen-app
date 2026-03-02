import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormCardComponent } from '../../../../../shared/components/form-card/form-card.component';
import { toSignal } from '@angular/core/rxjs-interop';

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
    MatSlideToggleModule,
    FormCardComponent,
  ],
  templateUrl: './financial-step.component.html',
  styleUrls: ['./financial-step.component.scss'],
})
export class FinancialStepComponent {
  readonly form = input.required<FormGroup>();
  readonly isOverdrawn = input<boolean>(false);

  readonly nextStep = output<void>();

  // Signal pour suivre la valeur du solde
  private accountBalanceSignal = computed(() => {
    const balance = this.form().get('accountBalance')?.value;
    return balance !== undefined && balance !== null ? Number(balance) : 0;
  });

  // Computed pour savoir si on est en découvert (valeur négative)
  readonly isNegativeBalance = computed(() => {
    return this.accountBalanceSignal() < 0;
  });

  // Computed pour savoir si le toggle doit être désactivé (solde positif)
  readonly isToggleDisabled = computed(() => {
    return this.accountBalanceSignal() >= 0;
  });

  // Valeur absolue pour l'affichage mobile
  readonly absoluteBalance = computed(() => {
    return Math.abs(this.accountBalanceSignal());
  });

  // Toggle le signe du solde
  onBalanceToggle(checked: boolean): void {
    const currentValue = this.accountBalanceSignal();
    const absoluteValue = Math.abs(currentValue);

    if (checked) {
      // Passer en négatif (découvert)
      this.form().get('accountBalance')?.setValue(-absoluteValue);
    } else {
      // Passer en positif
      this.form().get('accountBalance')?.setValue(absoluteValue);
    }
  }

  // Mettre à jour la valeur absolue quand l'input change
  onBalanceInput(value: number): void {
    const currentBalance = this.accountBalanceSignal();
    const isNegative = currentBalance < 0;

    if (isNegative && value > 0) {
      this.form().get('accountBalance')?.setValue(-value);
    } else {
      this.form().get('accountBalance')?.setValue(value);
    }
  }

  onNext(): void {
    if (this.form().valid) {
      this.nextStep.emit();
    }
  }
}
