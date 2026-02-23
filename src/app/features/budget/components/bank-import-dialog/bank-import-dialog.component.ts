import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { 
  BankImportService, 
  ImportedTransaction, 
  ImportResult, 
  BankFormat 
} from '../../services/bank-import.service';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../../../../models/budget.model';

interface CategoryMapping {
  keyword: string;
  category: ExpenseCategory;
}

@Component({
  selector: 'app-bank-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatStepperModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    CurrencyPipe
  ],
  templateUrl: './bank-import-dialog.component.html',
  styleUrls: ['./bank-import-dialog.component.scss']
})
export class BankImportDialogComponent {
  private dialogRef = inject(MatDialogRef<BankImportDialogComponent>);
  private bankImportService = inject(BankImportService);

  readonly data = inject<{ existingExpenses: any[] }>(MAT_DIALOG_DATA);

  // Étapes
  currentStep = signal(0);
  isLoading = signal(false);
  errorMessage = signal<string>('');

  // Fichier
  selectedFile = signal<File | null>(null);
  fileName = computed(() => this.selectedFile()?.name || '');
  fileType = computed(() => {
    const name = this.fileName().toLowerCase();
    if (name.endsWith('.ofx')) return 'OFX';
    if (name.endsWith('.csv')) return 'CSV';
    return 'Inconnu';
  });

  // Résultat d'import
  importResult = signal<ImportResult | null>(null);
  detectedFormat = signal<BankFormat>('unknown');

  // Transactions
  displayedColumns = ['selected', 'date', 'description', 'amount', 'type', 'category'];
  selectedTransactions = signal<Set<string>>(new Set());

  // Mapping automatique
  categoryMappings: CategoryMapping[] = [
    { keyword: 'INTERMARCHE|CARREFOUR|LECLERC|AUCHAN|LIDL|ALDI', category: 'food' },
    { keyword: 'SALAIRE|PAIE|REMUNERATION', category: 'savings' },
    { keyword: 'LOYER|LOCATION', category: 'housing' },
    { keyword: 'EDF|ENGIE|DIRECT ENERGIE|TOTAL ENERGIES', category: 'energy' },
    { keyword: 'ORANGE|SFR|BOUYGUES|FREE', category: 'phone' },
    { keyword: 'PARKING|PEAGE|AUTOROUTE', category: 'transport' },
    { keyword: 'PHARMACIE|PHIE', category: 'pharmacy' },
    { keyword: 'RESTAURANT|MC DONALD|BURGER KING|KFC|SUBWAY', category: 'restaurants' },
    { keyword: 'SALLE SPORT|GYM|FITNESS', category: 'gym' },
    { keyword: 'NETFLIX|SPOTIFY|DISNEY+|AMAZON PRIME', category: 'streaming' },
    { keyword: 'VETEMENT|ZARA|H&M|DECATHLON|BERSHKA', category: 'clothing' },
    { keyword: 'ASSURANCE|MAAF|MACIF|MAIF|GROUPAMA', category: 'insurance' },
    { keyword: 'CARBURANT|ESSENCE|STATION|BP|SHELL', category: 'fuel' },
    { keyword: 'CADEAU|FNAC|DARTY|BOULANGER', category: 'gifts' }
  ];

  getAllCategories() {
    return EXPENSE_CATEGORIES;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.errorMessage.set('');
    }
  }

  async onDropFile(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.ofx')) {
        this.selectedFile.set(file);
        this.errorMessage.set('');
      } else {
        this.errorMessage.set('Format de fichier non supporté. Utilisez CSV ou OFX.');
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.importResult.set(null);
    this.currentStep.set(0);
  }

  importFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const isOfx = file.name.toLowerCase().endsWith('.ofx');

    const importObservable = isOfx 
      ? this.bankImportService.importOfx(file)
      : this.bankImportService.importCsv(file);

    importObservable.subscribe({
      next: (result) => {
        this.isLoading.set(false);
        
        if (result.success) {
          // Détection du format pour les CSV
          if (!isOfx) {
            file.text().then(content => {
              this.detectedFormat.set(this.bankImportService.detectBankFormat(content));
            });
          }

          // Auto-catégorisation
          const categorizedTransactions = result.transactions.map(t => ({
            ...t,
            matchedCategory: this.autoCategorize(t.description)
          }));

          this.importResult.set({
            ...result,
            transactions: categorizedTransactions
          });

          // Sélectionner toutes les transactions par défaut
          const allIds = new Set(categorizedTransactions.map(t => t.id));
          this.selectedTransactions.set(allIds);

          this.currentStep.set(1);
        } else {
          this.errorMessage.set('Erreur lors de l\'import du fichier.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.errors?.[0] || 'Erreur lors de l\'import.');
      }
    });
  }

  autoCategorize(description: string): ExpenseCategory {
    const descUpper = description.toUpperCase();
    
    for (const mapping of this.categoryMappings) {
      const keywords = mapping.keyword.split('|');
      for (const keyword of keywords) {
        if (descUpper.includes(keyword)) {
          return mapping.category;
        }
      }
    }

    return 'other';
  }

  updateTransactionCategory(transaction: ImportedTransaction, category: ExpenseCategory): void {
    transaction.matchedCategory = category;
  }

  toggleTransactionSelection(transactionId: string): void {
    const current = new Set(this.selectedTransactions());
    if (current.has(transactionId)) {
      current.delete(transactionId);
    } else {
      current.add(transactionId);
    }
    this.selectedTransactions.set(current);
  }

  selectAll(): void {
    const allIds = new Set(this.importResult()?.transactions.map(t => t.id) || []);
    this.selectedTransactions.set(allIds);
  }

  deselectAll(): void {
    this.selectedTransactions.set(new Set());
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectAll();
    } else {
      this.deselectAll();
    }
  }

  isAllSelected(): boolean {
    const total = this.importResult()?.transactions.length || 0;
    return total > 0 && this.selectedTransactions().size === total;
  }

  isIndeterminate(): boolean {
    const selected = this.selectedTransactions().size;
    const total = this.importResult()?.transactions.length || 0;
    return selected > 0 && selected < total;
  }

  getSelectedTransactions(): ImportedTransaction[] {
    const selectedIds = this.selectedTransactions();
    return this.importResult()?.transactions.filter(t => selectedIds.has(t.id)) || [];
  }

  getTotalImported(): number {
    return this.getSelectedTransactions().reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalCredits(): number {
    return this.getSelectedTransactions()
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalDebits(): number {
    return this.getSelectedTransactions()
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  onConfirmImport(): void {
    const selectedTransactions = this.getSelectedTransactions();
    
    // Convertir en format Expense
    const expenses = selectedTransactions.map(t => ({
      id: t.id,
      name: t.description,
      category: t.matchedCategory || 'other',
      amount: t.amount,
      frequency: 'monthly' as const,
      monthlyEquivalent: t.amount
    }));

    this.dialogRef.close(expenses);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getFormatLabel(format: BankFormat): string {
    const labels: Record<BankFormat, string> = {
      'bnp': 'BNP Paribas',
      'sg': 'Société Générale',
      'credit-agricole': 'Crédit Agricole',
      'revolut': 'Revolut',
      'n26': 'N26',
      'boursobank': 'BoursoBank',
      'standard': 'Format Standard',
      'unknown': 'Format Inconnu'
    };
    return labels[format] || 'Format Inconnu';
  }
}
