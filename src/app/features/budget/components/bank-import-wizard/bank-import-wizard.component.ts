import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  BankImportService,
  ImportedTransaction,
  ImportResult
} from '../../services/bank-import.service';
import { EXPENSE_CATEGORIES, ExpenseCategory, Expense } from '../../../../models/budget.model';
import { BankSelectionStepComponent } from '../import-steps/bank-selection-step/bank-selection-step.component';
import { ExportGuideStepComponent } from '../import-steps/export-guide-step/export-guide-step.component';
import { FileUploadStepComponent } from '../import-steps/file-upload-step/file-upload-step.component';
import { TransactionValidationStepComponent } from '../import-steps/transaction-validation-step/transaction-validation-step.component';

// Couleurs par catégorie
const CATEGORY_COLOR_MAP: Record<string, string> = {
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

interface BankGuide {
  id: string;
  name: string;
  icon: string;
  color: string;
  steps: string[];
  tips: string[];
}

@Component({
  selector: 'app-bank-import-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatStepperModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatProgressBarModule,
    BankSelectionStepComponent,
    ExportGuideStepComponent,
    FileUploadStepComponent,
    TransactionValidationStepComponent
  ],
  templateUrl: './bank-import-wizard.component.html',
  styleUrls: ['./bank-import-wizard.component.scss']
})
export class BankImportWizardComponent {
  private dialogRef = inject(MatDialogRef<BankImportWizardComponent>);
  private bankImportService = inject(BankImportService);
  private snackBar = inject(MatSnackBar);
  private dialogData = inject<{ existingExpenses: Expense[] }>(MAT_DIALOG_DATA);

  constructor() {
    this.existingExpenses = this.dialogData.existingExpenses || [];
  }

  // Navigation
  currentStep = signal(0);
  selectedBank = signal<BankGuide | null>(null);
  isLoading = signal(false);

  // Fichier
  selectedFile = signal<File | null>(null);
  importResult = signal<ImportResult | null>(null);

  // Transactions
  selectedTransactions = signal<Set<string>>(new Set());
  editingTransaction = signal<string | null>(null);

  // Données existantes pour détection des doublons
  existingExpenses: Expense[] = [];

  // Liste des banques supportées avec guides
  banks: BankGuide[] = [
    {
      id: 'bnp',
      name: 'BNP Paribas',
      icon: 'account_balance',
      color: '#00915a',
      steps: [
        'Connectez-vous à votre espace client BNP Paribas',
        'Allez dans "Comptes" → "Relevés de compte"',
        'Cliquez sur "Télécharger" ou l\'icône d\'export',
        'Sélectionnez la période souhaitée (1 mois recommandé)',
        'Choisissez le format "OFX" ou "CSV"',
        'Téléchargez le fichier sur votre ordinateur'
      ],
      tips: [
        'Le format OFX est préféré pour une meilleure précision',
        'Vous pouvez exporter jusqu\'à 3 mois d\'historique',
        'Les transactions sont automatiquement catégorisées'
      ]
    },
    {
      id: 'sg',
      name: 'Société Générale',
      icon: 'account_balance',
      color: '#e9041e',
      steps: [
        'Connectez-vous à votre espace client SG',
        'Accédez à "Mes comptes" → "Opérations"',
        'Cliquez sur "Exporter mes opérations"',
        'Sélectionnez les dates de début et fin',
        'Choisissez le format de fichier',
        'Validez et téléchargez'
      ],
      tips: [
        'Privilégiez le format OFX pour plus de détails',
        'L\'export CSV fonctionne aussi très bien',
        'Exportez par périodes de 1 mois pour plus de clarté'
      ]
    },
    {
      id: 'ca',
      name: 'Crédit Agricole',
      icon: 'agriculture',
      color: '#0078a0',
      steps: [
        'Connectez-vous à votre espace CA',
        'Allez dans "Comptes" → "Relevés"',
        'Cliquez sur "Télécharger" (icône flèche vers le bas)',
        'Sélectionnez le compte et la période',
        'Choisissez "Format bancaire (OFX)"',
        'Téléchargez le fichier'
      ],
      tips: [
        'Le Crédit Agricole utilise le format OFX standard',
        'Vous pouvez exporter plusieurs mois à la fois',
        'Les virements et prélèvements sont bien identifiés'
      ]
    },
    {
      id: 'boursobank',
      name: 'BoursoBank',
      icon: 'account_balance_wallet',
      color: '#ff6b00',
      steps: [
        'Connectez-vous à votre compte BoursoBank',
        'Allez dans "Mes comptes"',
        'Cliquez sur "Exporter mes opérations"',
        'Sélectionnez la période et le format',
        'Téléchargez le fichier OFX ou CSV'
      ],
      tips: [
        'BoursoBank propose un export très complet',
        'Le format CSV est bien structuré',
        'Toutes les catégories de dépenses sont reconnaissables'
      ]
    },
    {
      id: 'revolut',
      name: 'Revolut',
      icon: 'credit_card',
      color: '#0075eb',
      steps: [
        'Ouvrez l\'application Revolut',
        'Allez dans votre profil → "Comptes"',
        'Sélectionnez "Exporter les relevés"',
        'Choisissez le compte et la période',
        'Sélectionnez le format CSV',
        'L\'export sera envoyé par email'
      ],
      tips: [
        'Revolut envoie l\'export par email',
        'Téléchargez le fichier depuis votre boîte mail',
        'Le format CSV est le seul disponible'
      ]
    },
    {
      id: 'n26',
      name: 'N26',
      icon: 'credit_card',
      color: '#2c3033',
      steps: [
        'Ouvrez l\'application N26',
        'Allez dans "Paramètres" → "Mes données"',
        'Sélectionnez "Exporter mes opérations"',
        'Choisissez la période et le format CSV',
        'Validez et téléchargez'
      ],
      tips: [
        'N26 propose uniquement le format CSV',
        'L\'export est très détaillé',
        'Les catégories N26 sont bien reconnues'
      ]
    }
  ];

  // Catégorisation automatique
  categoryMappings = [
    { keywords: ['INTERMARCHE','CARREFOUR','LECLERC','AUCHAN','LIDL','ALDI','MONOPRIX','FRANPRIX'], category: 'food', label: 'Alimentation' },
    { keywords: ['SALAIRE','PAIE','REMUNERATION','REVENUS'], category: 'income', label: 'Revenus' },
    { keywords: ['LOYER','LOCATION','CHARGES','COPROPRIETE'], category: 'housing', label: 'Logement' },
    { keywords: ['EDF','ENGIE','DIRECT ENERGIE','TOTAL ENERGIES','GAZ','ELECTRICITE'], category: 'utilities', label: 'Énergie' },
    { keywords: ['ORANGE','SFR','BOUYGUES','FREE','TELEPHONE','MOBILE'], category: 'phone', label: 'Téléphone' },
    { keywords: ['PARKING','PEAGE','AUTOROUTE','TOLL','CONDUCTEUR'], category: 'transport', label: 'Transport' },
    { keywords: ['PHARMACIE','PHIE','MEDICAL','HOPITAL'], category: 'healthcare', label: 'Santé' },
    { keywords: ['RESTAURANT','MC DONALD','BURGER KING','KFC','SUBWAY','PIZZA'], category: 'restaurants', label: 'Restauration' },
    { keywords: ['SALLE SPORT','GYM','FITNESS','MUSCULATION'], category: 'gym', label: 'Sport' },
    { keywords: ['NETFLIX','SPOTIFY','DISNEY+','PRIME','YOUTUBE','STREAMING'], category: 'streaming', label: 'Streaming' },
    { keywords: ['VETEMENT','ZARA','H&M','DECATHLON','BERSHKA','JENNYFER'], category: 'clothing', label: 'Vêtements' },
    { keywords: ['ASSURANCE','MAAF','MACIF','MAIF','GROUPAMA','AXA'], category: 'insurance', label: 'Assurances' },
    { keywords: ['CARBURANT','ESSENCE','STATION','BP','SHELL','TOTAL'], category: 'fuel', label: 'Carburant' },
    { keywords: ['CADEAU','FNAC','DARTY','BOULANGER','AMAZON'], category: 'shopping', label: 'Achats' }
  ];

  get categories() {
    return EXPENSE_CATEGORIES;
  }

  // Navigation entre les étapes
  goToStep(step: number): void {
    // Validation avant navigation
    if (step > this.currentStep() && !this.canGoToStep(step)) {
      this.showStepValidationError(step);
      return;
    }

    // Empêcher d'aller à l'étape 3 sans fichier
    if (step === 3 && !this.importResult()) {
      this.snackBar.open('Veuillez d\'abord importer un fichier', 'Fermer', { duration: 3000 });
      return;
    }

    this.currentStep.set(step);
  }

  nextStep(): void {
    const next = this.currentStep() + 1;
    if (next <= 3) {
      this.goToStep(next);
    }
  }

  previousStep(): void {
    const prev = this.currentStep() - 1;
    if (prev >= 0) {
      this.goToStep(prev);
    }
  }

  canGoToStep(step: number): boolean {
    switch (step) {
      case 0: return true;
      case 1: return !!this.selectedBank();
      case 2: return !!this.selectedBank();
      case 3: return !!this.importResult();
      default: return false;
    }
  }

  isStepAccessible(step: number): boolean {
    // Permet de revenir en arrière librement
    if (step < this.currentStep()) return true;
    // Permet d'avancer seulement si validé
    return this.canGoToStep(step);
  }

  private showStepValidationError(step: number): void {
    const messages: Record<number, string> = {
      1: 'Veuillez d\'abord sélectionner une banque',
      2: 'Veuillez d\'abord sélectionner une banque',
      3: 'Veuillez d\'abord importer votre fichier'
    };
    this.snackBar.open(messages[step] || 'Étape non accessible', 'Fermer', { duration: 3000 });
  }

  onBankSelect(bank: BankGuide): void {
    this.selectBank(bank);
  }

  selectBank(bank: BankGuide): void {
    this.selectedBank.set(bank);
    this.currentStep.set(1);
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.processFile();
  }

  onDropFile(file: File): void {
    if (file.name.match(/\.(csv|ofx)$/i)) {
      this.selectedFile.set(file);
      this.processFile();
    } else {
      this.snackBar.open('Format non supporté. Utilisez CSV ou OFX.', 'Fermer', { duration: 5000 });
    }
  }

  private processFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    const isOfx = file.name.toLowerCase().endsWith('.ofx');

    const import$ = isOfx
      ? this.bankImportService.importOfx(file)
      : this.bankImportService.importCsv(file);

    import$.subscribe({
      next: (result) => {
        this.isLoading.set(false);
        if (result.transactions.length > 0) {
          const categorized = result.transactions.map(t => ({
            ...t,
            matchedCategory: this.autoCategorize(t.description)
          }));
          this.importResult.set({ ...result, transactions: categorized });
          this.selectedTransactions.set(new Set(categorized.map(t => t.id)));
          this.currentStep.set(3);
        } else {
          this.snackBar.open('Aucune transaction trouvée dans ce fichier.', 'Fermer', { duration: 5000 });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(err.errors?.[0] || 'Erreur lors de l\'import.', 'Fermer', { duration: 5000 });
      }
    });
  }

  autoCategorize(description: string): ExpenseCategory {
    const desc = description.toUpperCase();
    for (const mapping of this.categoryMappings) {
      if (mapping.keywords.some(kw => desc.includes(kw))) {
        return mapping.category as ExpenseCategory;
      }
    }
    return 'other';
  }

  getCategoryLabel(category: string): string {
    const cat = this.categoryMappings.find(m => m.category === category);
    return cat?.label || 'Autre';
  }

  getCategoryColor(category: string): string {
    return CATEGORY_COLOR_MAP[category] || '#9e9e9e';
  }

  toggleSelection(id: string): void {
    const current = new Set(this.selectedTransactions());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedTransactions.set(current);
  }

  selectAll(): void {
    const all = new Set(this.importResult()?.transactions.map(t => t.id) || []);
    this.selectedTransactions.set(all);
  }

  deselectAll(): void {
    this.selectedTransactions.set(new Set());
  }

  get selectedCount(): number {
    return this.selectedTransactions().size;
  }

  get selectedTotal(): number {
    const ids = this.selectedTransactions();
    return this.importResult()?.transactions
      .filter(t => ids.has(t.id))
      .reduce((sum, t) => sum + t.amount, 0) || 0;
  }

  readonly creditCount = computed(() => this.importAnalysis().credits.count);
  readonly debitCount = computed(() => this.importAnalysis().debits.count);
  readonly stepLabels = ['Banque', 'Guide', 'Fichier', 'Validation'];
  readonly totalSteps = 4;

  // Analyse intelligente des transactions
  readonly importAnalysis = computed(() => {
    const transactions = this.importResult()?.transactions || [];
    const existing = this.existingExpenses;

    // Stats de base
    const credits = {
      count: transactions.filter(t => t.type === 'credit').length,
      total: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
    };

    const debits = {
      count: transactions.filter(t => t.type === 'debit').length,
      total: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
    };

    // Regroupement par catégorie
    const byCategory = transactions.reduce((acc, t) => {
      const cat = t.matchedCategory || 'other';
      if (!acc[cat]) {
        acc[cat] = { count: 0, total: 0, transactions: [] };
      }
      acc[cat].count++;
      acc[cat].total += t.amount;
      acc[cat].transactions.push(t);
      return acc;
    }, {} as Record<string, { count: number; total: number; transactions: typeof transactions }>);

    // Tri par montant décroissant
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    // Détection des doublons (transaction déjà existante avec description/montant similaire)
    const potentialDuplicates = transactions.filter(t => {
      return existing.some((e: Expense) => {
        const tDesc = t.description.replace(/\s+/g, '').toLowerCase();
        const eDesc = e.name?.replace(/\s+/g, '').toLowerCase() || '';
        const descMatch = tDesc.includes(eDesc) || eDesc.includes(tDesc);
        const amountMatch = Math.abs(t.amount - e.amount) < 0.01;
        return descMatch && amountMatch;
      });
    });

    // Transactions sans catégorie (nécessite attention)
    const uncategorized = transactions.filter(t => !t.matchedCategory || t.matchedCategory === 'other');

    // Top transactions (3 plus grosses dépenses)
    const topExpenses = transactions
      .filter(t => t.type === 'debit')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // Détection des patrons récurrents (même description, plusieurs fois)
    const recurringCandidates = Object.entries(
      transactions.reduce((acc, t) => {
        const key = t.description.trim().toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).filter(([, count]) => count >= 2);

    return {
      credits,
      debits,
      total: credits.total + debits.total,
      byCategory,
      topCategories,
      potentialDuplicates,
      uncategorized,
      topExpenses,
      recurringCandidates,
      categorizationRate: transactions.length > 0
        ? ((transactions.length - uncategorized.length) / transactions.length * 100).toFixed(0)
        : 0
    };
  });

  confirmImport(): void {
    const selected = this.importResult()?.transactions.filter(t =>
      this.selectedTransactions().has(t.id)
    ) || [];

    const expenses = selected.map(t => ({
      id: t.id,
      name: t.description,
      category: t.matchedCategory || 'other',
      amount: t.amount,
      frequency: 'monthly' as const,
      monthlyEquivalent: t.amount
    }));

    this.snackBar.open(`${expenses.length} transactions importées avec succès !`, 'Fermer', {
      duration: 3000,
      panelClass: 'success-snackbar'
    });

    this.dialogRef.close(expenses);
  }

  close(): void {
    this.dialogRef.close();
  }
}
