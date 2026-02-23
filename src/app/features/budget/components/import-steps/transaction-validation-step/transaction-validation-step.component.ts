import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

export interface ImportedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  rawData: string[];
  matchedCategory?: string;
  isDuplicate?: boolean;
}

export interface ImportResult {
  success: boolean;
  transactions: ImportedTransaction[];
  totalImported: number;
  totalCredits: number;
  totalDebits: number;
  errors: string[];
}

@Component({
  selector: 'app-transaction-validation-step',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './transaction-validation-step.component.html',
  styleUrls: ['./transaction-validation-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionValidationStepComponent {
  @Input() importResult: ImportResult | null = null;
  @Input() selectedTransactions: Set<string> = new Set<string>();
  
  @Output() toggleSelection = new EventEmitter<string>();
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();

  displayedColumns: string[] = ['select', 'date', 'description', 'category', 'amount', 'type'];

  onToggleSelection(transactionId: string): void {
    this.toggleSelection.emit(transactionId);
  }

  onSelectAll(): void {
    this.selectAll.emit();
  }

  onDeselectAll(): void {
    this.deselectAll.emit();
  }

  isAllSelected(): boolean {
    if (!this.importResult || this.importResult.transactions.length === 0) {
      return false;
    }
    return this.importResult.transactions.every(t => this.selectedTransactions.has(t.id));
  }

  isIndeterminate(): boolean {
    if (!this.importResult || this.importResult.transactions.length === 0) {
      return false;
    }
    const selectedCount = this.importResult.transactions.filter(t => this.selectedTransactions.has(t.id)).length;
    return selectedCount > 0 && selectedCount < this.importResult.transactions.length;
  }

  getSelectedCount(): number {
    return this.selectedTransactions.size;
  }

  getSelectedTotal(): number {
    if (!this.importResult) return 0;
    return this.importResult.transactions
      .filter(t => this.selectedTransactions.has(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getCategoryColor(category: string | undefined): string {
    const colors: Record<string, string> = {
      food: '#4caf50',
      housing: '#ff9800',
      utilities: '#795548',
      phone: '#9c27b0',
      transport: '#2196f3',
      healthcare: '#f44336',
      restaurants: '#ff5722',
      gym: '#00bcd4',
      streaming: '#e91e63',
      clothing: '#3f51b5',
      insurance: '#607d8b',
      fuel: '#ff9800',
      shopping: '#9c27b0',
      income: '#4caf50',
      other: '#9e9e9e'
    };
    return colors[category || 'other'] || '#9e9e9e';
  }

  getCategoryLabel(category: string | undefined): string {
    const labels: Record<string, string> = {
      food: 'Alimentation',
      housing: 'Logement',
      utilities: 'Services',
      phone: 'Téléphone',
      transport: 'Transport',
      healthcare: 'Santé',
      restaurants: 'Restauration',
      gym: 'Sport',
      streaming: 'Streaming',
      clothing: 'Vêtements',
      insurance: 'Assurances',
      fuel: 'Carburant',
      shopping: 'Achats',
      income: 'Revenus',
      other: 'Autre'
    };
    return labels[category || 'other'] || 'Autre';
  }
}
