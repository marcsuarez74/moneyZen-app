import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Expense } from '../../../models/budget.model';

@Component({
  selector: 'app-expense-item',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './expense-item.component.html',
  styleUrls: ['./expense-item.component.scss']
})
export class ExpenseItemComponent {
  readonly expense = input.required<Expense>();
  readonly icon = input<string>('help');
  readonly editable = input<boolean>(true);
  readonly removable = input<boolean>(true);
  
  readonly edit = output<Expense>();
  readonly remove = output<Expense>();
}
