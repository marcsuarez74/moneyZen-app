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
import { BudgetOptimizationService } from '../../../../services/budget-optimization.service';
import { PaydayCalculatorService, PaydayInfo } from '../../../../services/payday-calculator.service';
import { BudgetStatsDisplayComponent } from '../budget-stats-display/budget-stats-display.component';
import { ExpenseBreakdownComponent } from '../expense-breakdown/expense-breakdown.component';
import { BudgetRecommendationsComponent } from '../budget-recommendations/budget-recommendations.component';
import { BudgetInsightsComponent } from '../budget-insights/budget-insights.component';
import { DebtRecoveryPlanComponent, RecoveryPlanData } from '../debt-recovery-plan/debt-recovery-plan.component';
import { EditIncomeDialogComponent } from '../edit-income-dialog/edit-income-dialog.component';
import { EditExpensesDialogComponent } from '../edit-expenses-dialog/edit-expenses-dialog.component';
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
  template: `
    <div class="page-container">
      <!-- Header avec composant dumb -->
      <app-dashboard-header
        [hasUserData]="budgetStore.hasUserData()"
        [isNegativeBalance]="isNegativeBalance()"
        [paydayInfo]="paydayInfo()"
        [paydayMessage]="paydayMessage()"
        [upcomingCharges]="upcomingCharges()"
        [expenseCount]="budgetStore.expenses().length"
        [budgetHealth]="budgetAnalysis()?.metrics?.budgetHealth"
        (editIncome)="openEditIncome()"
        (editExpenses)="openEditExpenses()"
        (createNewBudget)="createNewBudget()"
      ></app-dashboard-header>

      <!-- Empty State -->
      @if (!budgetStore.hasUserData()) {
        <app-welcome-card></app-welcome-card>
      }

      <!-- Dashboard Content -->
      @if (budgetStore.hasUserData()) {
        <div class="dashboard-content">
          
          <!-- Plan de redressement -->
          @if (isNegativeBalance() && recoveryData(); as recovery) {
            <app-debt-recovery-plan
              [data]="recovery"
              (acceptPlan)="onAcceptRecoveryPlan($event)"
              (adjustPlan)="onAdjustRecoveryPlan($event)">
            </app-debt-recovery-plan>
          }
          
          <!-- Insights -->
          @if (priorityInsights().length > 0) {
            <app-budget-insights
              [insights]="priorityInsights()"
              (actionClicked)="handleInsightAction($event)">
            </app-budget-insights>
          }

          <!-- Stats -->
          <app-budget-stats-display
            [summary]="budgetStore.budgetSummary()!"
            [userData]="budgetStore.userData()!"
            [analysis]="budgetAnalysis()"
            [paydayInfo]="paydayInfo()">
          </app-budget-stats-display>

          <!-- Tabs -->
          <mat-tab-group class="dashboard-tabs" animationDuration="300ms">
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>pie_chart</mat-icon>
                Répartition
              </ng-template>
              <app-expense-breakdown
                [summary]="budgetStore.budgetSummary()!"
                [expenses]="budgetStore.expenses()"
                [thresholds]="categoryThresholds">
              </app-expense-breakdown>
            </mat-tab>

            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>lightbulb</mat-icon>
                Conseils
                @if (budgetAnalysis()?.recommendations?.length) {
                  <span class="tab-badge">{{ budgetAnalysis()?.recommendations?.length }}</span>
                }
              </ng-template>
              <app-budget-recommendations
                [analysis]="budgetAnalysis()"
                [summary]="budgetStore.budgetSummary()!">
              </app-budget-recommendations>
            </mat-tab>

            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>auto_graph</mat-icon>
                Projections
              </ng-template>
              <div class="scenarios-container">
                @for (scenario of scenarioArray(); track scenario.name) {
                  <mat-card class="scenario-card" [class]="getScenarioClass(scenario.name)">
                    <mat-card-header>
                      <mat-card-title>{{ scenario.name }}</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="scenario-metric">
                        <span>Épargne mensuelle</span>
                        <strong>{{ scenario.monthlySavings | currency:'EUR' }}</strong>
                      </div>
                      <div class="scenario-metric">
                        <span>Annuel</span>
                        <strong>{{ scenario.yearlyProjection | currency:'EUR' }}</strong>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
    }
    
    .dashboard-header {
      padding: 20px 32px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      
      &.negative {
        border-bottom-color: #f44336;
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, var(--surface) 100%);
      }
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      
      .header-left {
        h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 300;
        }
        
        .header-info {
          display: flex;
          align-items: center;
          gap: 16px;
          
          .payday-info {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: var(--text-secondary);
            
            mat-icon {
              font-size: 18px;
              color: #4caf50;
            }
            
            &.urgent {
              color: #ff9800;
              mat-icon { color: #ff9800; }
            }
            
            .daily-budget {
              font-weight: 600;
              color: var(--primary-color);
              
              &.tight {
                color: #ff9800;
                animation: pulse 2s infinite;
              }
            }
          }
          
          .alert-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 12px;
            background: #f44336;
            color: white;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
          }
          
          .charges-notification {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            background: #ff9800;
            color: white;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            
            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
            
            &.urgent {
              background: #f44336;
              animation: pulse 2s infinite;
            }
          }
        }
      }
      
      .header-actions {
        display: flex;
        gap: 10px;
        
        .action-btn {
          position: relative;
          padding: 8px 16px;
          
          &.charges-btn {
            padding-right: 36px; // Espace pour le badge
          }
          
          .btn-text {
            @media (max-width: 768px) {
              display: none;
            }
          }
          
          .expense-badge {
            position: absolute;
            top: -6px;
            right: -6px;
            min-width: 20px;
            height: 20px;
            padding: 0 6px;
            background: linear-gradient(135deg, #ff4081, #ff6e40);
            color: white;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 2px solid var(--surface);
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        }
      }
      
      .health-bar-container {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        
        .health-bar {
          flex: 1;
          height: 6px;
          background: var(--surface-variant);
          border-radius: 3px;
          overflow: hidden;
          
          .health-indicator {
            height: 100%;
            border-radius: 3px;
            transition: all 0.5s ease;
            
            &.healthy { background: linear-gradient(90deg, #4caf50, #8bc34a); }
            &.warning { background: linear-gradient(90deg, #ff9800, #ffc107); }
            &.critical { background: linear-gradient(90deg, #f44336, #ff5722); }
          }
        }
        
        .health-label {
          font-size: 12px;
          color: var(--text-secondary);
          white-space: nowrap;
        }
      }
    }

    .dashboard-content {
      padding: 24px 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .dashboard-tabs {
      .tab-icon {
        margin-right: 8px;
      }
      
      .tab-badge {
        margin-left: 8px;
        padding: 2px 8px;
        background: #ff4081;
        color: white;
        border-radius: 10px;
        font-size: 11px;
      }
    }
    
    .scenarios-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 16px 0;
      
      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
      
      .scenario-card {
        border-left: 4px solid;
        
        &.conservateur { border-left-color: #f44336; }
        &.realiste { border-left-color: #ff9800; }
        &.optimise { border-left-color: #4caf50; }
        
        .scenario-metric {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          
          span {
            font-size: 14px;
            color: var(--text-secondary);
          }
          
          strong {
            font-size: 16px;
          }
        }
      }
    }
  `]
})
export class BudgetDashboardPageComponent implements OnInit {
  private storageService = inject(LocalStorageService);
  private advisorService = inject(BudgetAdvisorService);
  private optimizationService = inject(BudgetOptimizationService);
  private paydayCalculator = inject(PaydayCalculatorService);
  private dialog = inject(MatDialog);
  
  protected budgetStore = inject(BudgetStore);
  protected categoryThresholds = this.advisorService['categoryThresholds'];
  protected getCategoriesByGroup = getCategoriesByGroup;
  
  // State
  readonly budgetAnalysis = signal<BudgetAnalysis | null>(null);
  
  // Computed
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
    // Ne pas afficher de solde négatif si aucune donnée utilisateur
    if (!this.budgetStore.hasUserData()) return false;
    
    const balance = this.budgetStore.userData()?.accountBalance || 0;
    // Si isPositiveBalance est explicitement défini à false, c'est négatif
    // Sinon, c'est négatif seulement si balance < 0
    const userData = this.budgetStore.userData();
    if (userData?.isPositiveBalance === false) return true;
    return balance < 0;
  });
  
  readonly recoveryData = computed((): RecoveryPlanData | null => {
    const userData = this.budgetStore.userData();
    const summary = this.budgetStore.budgetSummary();
    
    if (!userData || !summary) return null;
    
    // Calculer les charges fixes
    const fixedExpenses = this.budgetStore.expenses()
      .filter(e => ['housing', 'mortgage', 'carLoan', 'insurance'].includes(e.category))
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
  
  // Charges fixes à venir dans le mois
  readonly upcomingCharges = computed(() => {
    const expenses = this.budgetStore.expenses();
    const userData = this.budgetStore.userData();
    
    if (!expenses || !userData?.paydayDay) return null;
    
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Charges mensuelles non encore prélevées (entre aujourd'hui et la fin du mois)
    // On estime qu'une charge fixe est prélevée à une date fixe
    // Pour simplifier, on considère que toutes les charges fixes sont prélevées à des dates réparties dans le mois
    const fixedCategories = ['housing', 'mortgage', 'insurance', 'carLoan', 'utilities', 'internet', 'phone'];
    
    const upcomingFixedCharges = expenses.filter(expense => {
      if (!fixedCategories.includes(expense.category)) return false;
      if (expense.frequency !== 'monthly') return false;
      
      // Simulation : on suppose que chaque type de charge est prélevé à une date spécifique
      // Par exemple : loyer le 5, assurances le 10, etc.
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
    // Estimation des jours de prélèvement classiques
    const chargeDays: Record<string, number> = {
      'housing': 5,      // Loyer souvent le 5
      'mortgage': 5,     // Crédit immo souvent le 5
      'carLoan': 10,     // Crédit auto souvent entre le 5 et le 10
      'insurance': 12,   // Assurances souvent autour du 10-15
      'utilities': 15,   // Factures services autour du 15
      'internet': 20,    // Internet souvent vers le 20
      'phone': 20        // Téléphone souvent vers le 20
    };
    
    return chargeDays[category] || 15; // Par défaut le 15
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
  
  private saveAndRecalculate(): void {
    // Sauvegarder
    this.storageService.saveBudgetState({
      userData: this.budgetStore.userData(),
      expenses: this.budgetStore.expenses(),
      isLoading: false,
      error: null
    });
    
    // Recalculer immédiatement l'analyse
    this.calculateAnalysis();
    
    // Forcer la détection du changement en mettant à jour les computed
    // Les signals Angular font ça automatiquement
  }
  
  createNewBudget(): void {
    if (confirm('Créer un nouveau budget ? Les données actuelles seront remplacées.')) {
      this.budgetStore.clearBudget();
      this.budgetAnalysis.set(null);
    }
  }
  
  onAcceptRecoveryPlan(event: { duration: number; monthlyBudget: number; dailyBudget: number }): void {
    console.log('Plan accepté:', event);
    // TODO: Sauvegarder l'engagement
  }
  
  onAdjustRecoveryPlan(duration: number): void {
    console.log('Nouvelle durée:', duration);
    // Le composant enfant gère déjà le slider
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
