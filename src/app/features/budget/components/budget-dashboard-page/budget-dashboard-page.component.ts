import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BudgetStore } from '../../../../store/budget.store';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { BudgetAdvisorService, BudgetAnalysis, FinancialInsight } from '../../../../services/budget-advisor.service';
import { PaydayCalculatorService, PaydayInfo } from '../../../../services/payday-calculator.service';
import { BudgetStatsDisplayComponent } from '../budget-stats-display/budget-stats-display.component';
import { ExpenseBreakdownComponent } from '../expense-breakdown/expense-breakdown.component';
import { BudgetRecommendationsComponent } from '../budget-recommendations/budget-recommendations.component';
import { BudgetInsightsComponent } from '../budget-insights/budget-insights.component';
import { DebtRecoveryPlanComponent, RecoveryPlanData } from '../debt-recovery-plan/debt-recovery-plan.component';
import { EditIncomeDialogComponent } from '../edit-income-dialog/edit-income-dialog.component';
import { EditExpensesDialogComponent } from '../edit-expenses-dialog/edit-expenses-dialog.component';
import { BankImportWizardComponent } from '../bank-import-wizard/bank-import-wizard.component';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { WelcomeCardComponent } from '../welcome-card/welcome-card.component';
import { Expense, UserFinancialData, getCategoriesByGroup } from '../../../../models/budget.model';

@Component({
  selector: 'app-budget-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule,
    MatBadgeModule,
    MatProgressBarModule,
    CurrencyPipe,
    BudgetStatsDisplayComponent,
    ExpenseBreakdownComponent,
    BudgetRecommendationsComponent,
    BudgetInsightsComponent,
    DebtRecoveryPlanComponent,
    DashboardHeaderComponent,
    WelcomeCardComponent
  ],
  templateUrl: './budget-dashboard-page.component.html',
  styleUrls: ['./budget-dashboard-page.component.scss']
})
export class BudgetDashboardPageComponent implements OnInit {
  private storageService = inject(LocalStorageService);
  private advisorService = inject(BudgetAdvisorService);
  private paydayCalculator = inject(PaydayCalculatorService);
  private dialog = inject(MatDialog);
  
  protected budgetStore = inject(BudgetStore);
  protected categoryThresholds = this.advisorService['categoryThresholds'];
  protected getCategoriesByGroup = getCategoriesByGroup;
  
  readonly budgetAnalysis = signal<BudgetAnalysis | null>(null);
  
  readonly priorityInsights = computed(() => {
    const analysis = this.budgetAnalysis();
    return analysis?.insights?.filter(i => i.priority >= 7).slice(0, 3) || [];
  });
  
  readonly scenarioArray = computed(() => {
    const scenarios = this.budgetAnalysis()?.scenarios;
    if (!scenarios) return [];
    return [scenarios.worstCase, scenarios.realistic, scenarios.optimized];
  });
  
  readonly isNegativeBalance = computed(() => {
    if (!this.budgetStore.hasUserData()) return false;
    const balance = this.budgetStore.userData()?.accountBalance || 0;
    const userData = this.budgetStore.userData();
    if (userData?.isPositiveBalance === false) return true;
    return balance < 0;
  });
  
  readonly recoveryData = computed((): RecoveryPlanData | null => {
    const userData = this.budgetStore.userData();
    const summary = this.budgetStore.budgetSummary();
    
    if (!userData || !summary) return null;
    
    // Charges fixes obligatoires : crédits, loyer, taxes, charges copro, services indispensables
    const fixedExpenses = this.budgetStore.expenses()
      .filter(e => [
        'housing',         // Loyer
        'mortgage',        // Crédit immobilier
        'condoFees',       // Charges de copropriété
        'propertyTax',     // Taxe foncière
        'housingServices', // Services logement (ménage, jardinier)
        'carLoan',         // Crédit voiture
        'consumerLoan',    // Crédit consommation
        'debtRepayment',   // Remboursement dettes
        'energy',          // Électricité/Gaz
        'water',           // Eau
        'internet',        // Internet
        'phone',           // Téléphone
        'tvStreaming',     // Box TV
        'homeInsurance',   // Assurance habitation
        'carInsurance',    // Assurance auto
        'healthInsurance', // Mutuelle santé
        'lifeInsurance'    // Assurance vie
      ].includes(e.category))
      .reduce((sum, e) => sum + e.monthlyEquivalent, 0);
    
    return {
      overdraftAmount: Math.abs(userData.accountBalance),
      monthlyIncome: userData.salary,
      fixedExpenses,
      remainingBudget: summary.remainingBudget
    };
  });
  
  readonly paydayInfo = computed((): PaydayInfo | null => {
    const userData = this.budgetStore.userData();
    const summary = this.budgetStore.budgetSummary();
    
    if (!userData?.paydayDay || !summary) return null;
    
    return this.paydayCalculator.calculatePaydayInfo(
      userData.salary,
      userData.paydayDay,
      summary.remainingBudget
    );
  });
  
  readonly paydayMessage = computed((): string => {
    const info = this.paydayInfo();
    const summary = this.budgetStore.budgetSummary();
    
    if (!info || !summary) return '';
    
    return this.paydayCalculator.getPaydayMessage(info, summary.remainingBudget);
  });
  
  readonly upcomingCharges = computed(() => {
    const expenses = this.budgetStore.expenses();
    const userData = this.budgetStore.userData();
    
    if (!expenses || !userData?.paydayDay) return null;
    
    const today = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const fixedCategories = [
      'housing', 'mortgage', 'condoFees', 'propertyTax', 'housingServices',
      'carLoan', 'consumerLoan', 'debtRepayment',
      'energy', 'water', 'internet', 'phone', 'tvStreaming',
      'homeInsurance', 'carInsurance', 'healthInsurance', 'lifeInsurance'
    ];
    
    const upcomingFixedCharges = expenses.filter(expense => {
      if (!fixedCategories.includes(expense.category)) return false;
      if (expense.frequency !== 'monthly') return false;
      
      const chargeDay = this.getEstimatedChargeDay(expense.category);
      return chargeDay >= today && chargeDay <= daysInMonth;
    });
    
    const totalUpcoming = upcomingFixedCharges.reduce((sum, e) => sum + e.monthlyEquivalent, 0);
    
    return {
      charges: upcomingFixedCharges,
      total: totalUpcoming,
      count: upcomingFixedCharges.length
    };
  });
  
  private getEstimatedChargeDay(category: string): number {
    const chargeDays: Record<string, number> = {
      'housing': 5,
      'mortgage': 5,
      'carLoan': 10,
      'insurance': 12,
      'utilities': 15,
      'internet': 20,
      'phone': 20
    };
    return chargeDays[category] || 15;
  }
  
  ngOnInit(): void {
    this.loadSavedData();
  }
  
  private loadSavedData(): void {
    const savedState = this.storageService.loadBudgetState();
    if (savedState) {
      if (savedState.userData) this.budgetStore.setUserData(savedState.userData);
      if (savedState.expenses?.length > 0) this.budgetStore.setExpenses(savedState.expenses);
      this.calculateAnalysis();
    }
  }
  
  private calculateAnalysis(): void {
    const userData = this.budgetStore.userData();
    const expenses = this.budgetStore.expenses();
    const summary = this.budgetStore.budgetSummary();
    
    if (userData && summary) {
      const analysis = this.advisorService.analyzeBudget(userData, expenses, summary);
      this.budgetAnalysis.set(analysis);
    }
  }
  
  openEditIncome(): void {
    const dialogRef = this.dialog.open(EditIncomeDialogComponent, {
      width: '500px',
      data: { userData: this.budgetStore.userData() }
    });
    
    dialogRef.afterClosed().subscribe((result: UserFinancialData | undefined) => {
      if (result) {
        this.budgetStore.setUserData(result);
        this.saveAndRecalculate();
      }
    });
  }
  
  openEditExpenses(): void {
    const dialogRef = this.dialog.open(EditExpensesDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { expenses: this.budgetStore.expenses() }
    });

    dialogRef.afterClosed().subscribe((result: Expense[] | undefined) => {
      if (result) {
        this.budgetStore.setExpenses(result);
        this.saveAndRecalculate();
      }
    });
  }

  openBankImport(): void {
    const dialogRef = this.dialog.open(BankImportWizardComponent, {
      width: '950px',
      maxHeight: '90vh',
      data: { existingExpenses: this.budgetStore.expenses() }
    });

    dialogRef.afterClosed().subscribe((result: Expense[] | undefined) => {
      if (result && result.length > 0) {
        const currentExpenses = this.budgetStore.expenses();
        const updatedExpenses = [...currentExpenses, ...result];
        this.budgetStore.setExpenses(updatedExpenses);
        this.saveAndRecalculate();
      }
    });
  }

  private saveAndRecalculate(): void {
    this.storageService.saveBudgetState({
      userData: this.budgetStore.userData(),
      expenses: this.budgetStore.expenses(),
      isLoading: false,
      error: null
    });
    
    this.calculateAnalysis();
  }
  
  createNewBudget(): void {
    if (confirm('Créer un nouveau budget ? Les données actuelles seront remplacées.')) {
      this.budgetStore.clearBudget();
      this.budgetAnalysis.set(null);
    }
  }
  
  onAcceptRecoveryPlan(event: { duration: number; monthlyBudget: number; dailyBudget: number }): void {
    console.log('Plan accepté:', event);
  }
  
  onAdjustRecoveryPlan(duration: number): void {
    console.log('Nouvelle durée:', duration);
  }
  
  handleInsightAction(insight: FinancialInsight): void {
    console.log('Action:', insight);
  }
  
  getScenarioClass(name: string): string {
    const map: Record<string, string> = {
      'Conservateur': 'conservateur',
      'Réaliste': 'realiste',
      'Optimisé': 'optimise'
    };
    return map[name] || '';
  }
}