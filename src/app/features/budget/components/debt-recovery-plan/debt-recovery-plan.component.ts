import { Component, input, output, computed, signal, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { PlanStore } from '../../../../store/plan.store';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { BudgetStore } from '../../../../store/budget.store';
import { ExpenseRecordStore } from '../../../../store/expense-record.store';
import { QuickExpenseComponent } from '../quick-expense/quick-expense.component';
import { RecentExpensesComponent } from '../recent-expenses/recent-expenses.component';
import { PlanNavigationComponent, PlanSection } from '../../../../shared/components/plan-navigation/plan-navigation.component';

export interface RecoveryPlanData {
  overdraftAmount: number;
  monthlyIncome: number;
  fixedExpenses: number;
  remainingBudget: number;
  paydayDay?: number; // Jour du mois de la paie (1-31)
}

export interface RecoveryPlanInfo {
  startDate: Date;
  startDateFormatted: string;
  daysUntilStart: number;
  currentMonthInfo: string;
  hasStarted: boolean;
  endDateFormatted: string;
}

export interface MonthlyTarget {
  month: number;
  monthName: string;
  startOverdraft: number;
  endOverdraft: number;
  availableBudget: number;
  dailyBudget: number;
  overdraftReduction: number;
  isAchievable: boolean;
}

@Component({
  selector: 'app-debt-recovery-plan',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatExpansionModule,
    FormsModule,
    CurrencyPipe,
    QuickExpenseComponent,
    RecentExpensesComponent,
    PlanNavigationComponent
  ],
  templateUrl: './debt-recovery-plan.component.html',
  styleUrls: ['./debt-recovery-plan.component.scss']
})
export class DebtRecoveryPlanComponent implements OnInit {
  @ViewChild('durationSection') durationSection!: ElementRef;
  @ViewChild('recoveryCard') recoveryCard!: ElementRef;
  @ViewChild('recentExpenses', { read: ElementRef }) recentExpenses!: ElementRef;

  private planStore = inject(PlanStore);
  private budgetStore = inject(BudgetStore);
  private storageService = inject(LocalStorageService);
  private expenseStore = inject(ExpenseRecordStore);

  readonly data = input.required<RecoveryPlanData>();
  readonly acceptPlan = output<{ duration: number; monthlyBudget: number; dailyBudget: number; adopted: boolean }>();
  readonly adjustPlan = output<number>();

  readonly Math = Math;
  readonly selectedDuration = signal(6);
  readonly daysInMonth = signal(30);

  // Informations sur le plan de redressement
  readonly planInfo = computed((): RecoveryPlanInfo => {
    const today = new Date();
    const paydayDay = this.data().paydayDay || 1;
    const durationMonths = this.selectedDuration();

    // Créer une date sans l'heure pour comparer uniquement les jours
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Calculer la date de paie de ce mois
    const currentMonthPayday = new Date(today.getFullYear(), today.getMonth(), paydayDay);
    
    // Déterminer si le plan a déjà commencé (la paie de ce mois est déjà passée)
    const hasStarted = todayWithoutTime > currentMonthPayday;
    
    // Calculer la prochaine date de paie
    let nextPayday: Date;
    if (hasStarted) {
      // Le plan a déjà commencé ce mois-ci, donc la "prochaine paie" est celle du mois prochain
      // mais le plan considère que ça a commencé à la paie de ce mois
      nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, paydayDay);
    } else if (todayWithoutTime.getTime() === currentMonthPayday.getTime()) {
      // C'est aujourd'hui le jour de paie
      nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, paydayDay);
    } else {
      // La paie est encore dans le futur de ce mois
      nextPayday = new Date(currentMonthPayday);
    }

    // Calculer le nombre de jours jusqu'à la prochaine paie
    const diffTime = nextPayday.getTime() - todayWithoutTime.getTime();
    const daysUntilStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Formater la date de début
    const startDateFormatted = hasStarted 
      ? currentMonthPayday.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : nextPayday.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
    
    // Calculer la date de fin (date de début + durée en mois)
    const endDate = new Date(hasStarted ? currentMonthPayday : nextPayday);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    const endDateFormatted = endDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Info sur le mois actuel
    const currentMonthInfo = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    return {
      startDate: hasStarted ? currentMonthPayday : nextPayday,
      startDateFormatted,
      daysUntilStart,
      currentMonthInfo,
      hasStarted,
      endDateFormatted
    };
  });

  readonly targetMonths = computed(() => this.selectedDuration());

  // Minimum pour survivre (courses basiques, transport, etc.)
  readonly minimumLivingCost = computed(() => {
    return Math.max(300, this.data().monthlyIncome * 0.15);
  });

  // Budget mensuel recommandé (ce qu'on peut dépenser en extra)
  readonly recommendedMonthlyBudget = computed(() => {
    const remaining = this.data().remainingBudget;
    const minRecovery = Math.ceil(this.data().overdraftAmount / this.targetMonths());
    const availableBudget = remaining - minRecovery;
    return Math.max(this.minimumLivingCost(), availableBudget);
  });

  // Budget quotidien recommandé
  readonly recommendedDailyBudget = computed(() => {
    return this.recommendedMonthlyBudget() / this.daysInMonth();
  });

  // Combien on doit minimum récupérer par mois pour remonter à temps
  // Dépenses ponctuelles du mois en cours
  readonly currentMonthExpenses = computed(() => this.expenseStore.currentMonthTotal());

  // Budget mensuel ajusté avec les dépenses déjà effectuées
  readonly adjustedMonthlyBudget = computed(() => {
    const recommended = this.recommendedMonthlyBudget();
    const spent = this.currentMonthExpenses();
    return Math.max(0, recommended - spent);
  });

  // Budget quotidien ajusté
  readonly adjustedDailyBudget = computed(() => {
    return this.adjustedMonthlyBudget() / this.daysInMonth();
  });

  readonly minimumRecoveryPerMonth = computed(() => {
    return Math.ceil(this.data().overdraftAmount / this.targetMonths());
  });

  // Combien le découvert baisse chaque mois en moyenne
  readonly monthlyRecovery = computed(() => {
    const remaining = this.data().remainingBudget;
    const minLiving = this.minimumLivingCost();
    const recovery = remaining - minLiving;
    return Math.max(0, recovery);
  });

  // Solde estimé à la fin du plan
  readonly estimatedFinalBalance = computed(() => {
    const totalRecovery = this.monthlyRecovery() * this.targetMonths();
    const finalOverdraft = Math.max(0, this.data().overdraftAmount - totalRecovery);
    return -finalOverdraft;
  });

  // Durée minimum
  readonly minDuration = computed(() => {
    if (this.data().remainingBudget <= 0) return 12;
    const minMonths = Math.ceil(this.data().overdraftAmount / (this.data().remainingBudget * 0.5));
    return Math.max(3, Math.min(12, minMonths));
  });

  readonly monthlyTargets = computed((): MonthlyTarget[] => {
    const targets: MonthlyTarget[] = [];
    const remainingBudget = this.data().remainingBudget;
    const minLiving = this.minimumLivingCost();
    let currentOverdraft = this.data().overdraftAmount;
    const planStartDate = this.planInfo().startDate;

    for (let i = 1; i <= this.targetMonths(); i++) {
      const startDate = new Date(planStartDate);
      startDate.setMonth(startDate.getMonth() + i - 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const startDateStr = startDate.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long',
        year: startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined
      });
      const endDateStr = endDate.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      const monthName = `${startDateStr} - ${endDateStr}`;

      const monthsLeft = this.targetMonths() - i + 1;
      const minRequiredRecovery = currentOverdraft / monthsLeft;

      let availableBudget = remainingBudget - minRequiredRecovery;
      availableBudget = Math.max(minLiving, availableBudget);

      const actualRecovery = remainingBudget - availableBudget;
      const newOverdraft = Math.max(0, currentOverdraft - actualRecovery);

      targets.push({
        month: i,
        monthName,
        startOverdraft: currentOverdraft,
        endOverdraft: newOverdraft,
        availableBudget,
        dailyBudget: availableBudget / this.daysInMonth(),
        overdraftReduction: actualRecovery,
        isAchievable: availableBudget >= minLiving
      });

      currentOverdraft = newOverdraft;
    }

    return targets;
  });

  readonly hasDifficultMonths = computed(() => {
    return this.monthlyTargets().some(t => !t.isAchievable);
  });

  readonly recommendedDuration = computed(() => {
    if (this.data().remainingBudget <= 0) return 12;

    const minDailyBudget = 15;
    const minMonthlyBudget = minDailyBudget * this.daysInMonth();
    const availableForRecovery = this.data().remainingBudget - minMonthlyBudget;

    if (availableForRecovery <= 0) return 12;

    const recommendedMonths = Math.ceil(this.data().overdraftAmount / availableForRecovery);
    return Math.max(3, Math.min(12, recommendedMonths));
  });

  // Configuration des sections pour la navigation
  readonly planSections = computed((): PlanSection[] => [
    { id: 'plan-info', label: 'Fonctionnement', icon: 'info', visible: true },
    { id: 'plan-next-step', label: 'Prochaine étape', icon: 'event_available', visible: this.planInfo().daysUntilStart >= 0 },
    { id: 'plan-situation', label: 'Votre situation', icon: 'account_balance', visible: true },
    { id: 'plan-strategy', label: 'Stratégie', icon: 'lightbulb', visible: true },
    { id: 'plan-expenses', label: 'Suivi des dépenses', icon: 'add_circle', visible: true },
    { id: 'plan-duration', label: 'Durée', icon: 'schedule', visible: true },
    { id: 'plan-evolution', label: 'Évolution', icon: 'flag', visible: true },
    { id: 'plan-tips', label: 'Conseils', icon: 'tips_and_updates', visible: true }
  ]);

  ngOnInit(): void {
    // Charger les dépenses ponctuelles
    this.expenseStore.loadExpenses();
  }

  updateDuration(value: number): void {
    this.selectedDuration.set(value);
    this.adjustPlan.emit(value);
  }

  scrollToDuration(): void {
    this.durationSection?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  scrollToRecentExpenses(): void {
    this.recentExpenses?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  adoptPlan(): void {
    const userData = this.budgetStore.userData();
    const planInfo = this.planInfo();

    this.acceptPlan.emit({
      duration: this.targetMonths(),
      monthlyBudget: this.recommendedMonthlyBudget(),
      dailyBudget: this.recommendedDailyBudget(),
      adopted: true
    });

    // Créer et sauvegarder le plan dans le store
    this.planStore.createPlan({
      type: 'debt-recovery',
      durationMonths: this.targetMonths(),
      monthlyBudget: this.recommendedMonthlyBudget(),
      dailyBudget: this.recommendedDailyBudget(),
      paydayDay: userData?.paydayDay || 1,
      startDate: planInfo.startDate.toISOString(),
      targets: this.monthlyTargets()
    });

    // Persister dans le localStorage
    this.storageService.savePlanState({
      activePlan: this.planStore.activePlan(),
      pastPlans: this.planStore.pastPlans()
    });

    console.log('✅ Plan sauvegardé avec succès !');
    
    const alertMessage = planInfo.daysUntilStart > 0 
      ? `Plan adopté et sauvegardé ! 🎯\n\nVotre plan démarrera le ${planInfo.startDateFormatted}.\n\n📊 Objectif : remonter votre découvert de ${this.data().overdraftAmount}€ sur ${this.targetMonths()} mois.\n💰 Budget mensuel : ${this.recommendedMonthlyBudget().toFixed(0)}€\n📅 Budget quotidien : ${this.recommendedDailyBudget().toFixed(0)}€/jour\n\n⚠️ N'oubliez pas : Mettez à jour votre solde bancaire le jour de votre paie pour un suivi précis !`
      : `Plan adopté et sauvegardé ! 🎯\n\nVotre plan démarre aujourd'hui !\n\n📊 Objectif : remonter votre découvert de ${this.data().overdraftAmount}€ sur ${this.targetMonths()} mois.\n💰 Budget mensuel : ${this.recommendedMonthlyBudget().toFixed(0)}€\n📅 Budget quotidien : ${this.recommendedDailyBudget().toFixed(0)}€/jour\n\n⚠️ N'oubliez pas : Mettez à jour votre solde bancaire le jour de votre paie pour un suivi précis !`;
    
    alert(alertMessage);
  }
}
