import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface BankGuide {
  id: string;
  name: string;
  icon: string;
  color: string;
  steps: string[];
  tips: string[];
}

@Component({
  selector: 'app-bank-selection-step',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule
],
  templateUrl: './bank-selection-step.component.html',
  styleUrls: ['./bank-selection-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankSelectionStepComponent {
  @Input() banks: BankGuide[] = [];
  @Output() selectBank = new EventEmitter<BankGuide>();

  onSelectBank(bank: BankGuide): void {
    this.selectBank.emit(bank);
  }
}
