import {
  Component,
  input,
  output,
  computed,
  signal,
  ViewChild,
  ElementRef,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { PlanStore } from '../../../../store/plan.store';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { BudgetStore } from '../../../../store/budget.store';
import { ExpenseRecordStore } from '../../../../store/expense-record.store';
import { MonthlyTarget } from '../../../../features/budget/components/debt-recovery-plan/debt-recovery-plan.component';
import {
  PlanNavigationComponent,
  PlanSection,
} from '../../../../shared/components/plan-navigation/plan-navigation.component';
import {
  PlanCardComponent,
  PlanInfoSectionComponent,
  PlanStrategySectionComponent,
  PlanSituationSectionComponent,
  type InfoCard,
  type SituationMetric,
} from '../../../../shared/components';

export interface SavingsPlanData {
  targetAmount: number;
  monthlyIncome: number;
  fixedExpenses: number;
  remainingBudget: number;
  hasDebtRecoveryPlan: boolean;
  paydayDay?: number;
}

export interface SavingsPlanInfo {
  startDate: Date;
  startDateFormatted: string;
  daysUntilStart: number;
  currentMonthInfo: string;
  hasStarted: boolean;
  endDateFormatted: string;
  estimatedCompletionDate: Date;
}

export interface MonthlySavingsTarget {
  month: number;
  monthName: string;
  startAmount: number;
  endAmount: number;
  contribution: number;
  isAchievable: boolean;
}

@Component({
  selector: 'app-savings-plan',
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
    FormsModule,
    CurrencyPipe,
    PlanNavigationComponent,
    PlanCardComponent,
    PlanInfoSectionComponent,
    PlanStrategySectionComponent,
    PlanSituationSectionComponent,
  ],
  templateUrl: './savings-plan.component.html',
  styleUrls: ['./savings-plan.component.scss'],
})
export class SavingsPlanComponent implements OnInit {
  @ViewChild('contributionSection') contributionSection!: ElementRef;

  private planStore = inject(PlanStore);
  private budgetStore = inject(BudgetStore);
  private storageService = inject(LocalStorageService);
  private expenseStore = inject(ExpenseRecordStore);

  readonly data = input.required<SavingsPlanData>();
  readonly acceptPlan = output<{
    duration: number;
    monthlyContribution: number;
    targetAmount: number;
    adopted: boolean;
  }>();
  readonly adjustPlan = output<number>();

  readonly Math = Math;
  readonly selectedDuration = signal(12);
  readonly monthlyContribution = signal(0);

  readonly planInfo = computed((): SavingsPlanInfo => {
    const today = new Date();
    const paydayDay = this.data().paydayDay || 1;
    const durationMonths = this.selectedDuration();

    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const currentMonthPayday = new Date(today.getFullYear(), today.getMonth(), paydayDay);

    const hasStarted = todayWithoutTime > currentMonthPayday;

    let nextPayday: Date;
    if (hasStarted) {
      nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, paydayDay);
    } else if (todayWithoutTime.getTime() === currentMonthPayday.getTime()) {
      nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, paydayDay);
    } else {
      nextPayday = new Date(currentMonthPayday);
    }

    const diffTime = nextPayday.getTime() - todayWithoutTime.getTime();
    const daysUntilStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const startDateFormatted = hasStarted
      ? currentMonthPayday.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : nextPayday.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

    const endDate = new Date(hasStarted ? currentMonthPayday : nextPayday);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const estimatedCompletionDate = new Date(endDate);

    const endDateFormatted = endDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const currentMonthInfo = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return {
      startDate: hasStarted ? currentMonthPayday : nextPayday,
      startDateFormatted,
      daysUntilStart,
      currentMonthInfo,
      hasStarted,
      endDateFormatted,
      estimatedCompletionDate,
    };
  });

  readonly targetMonths = computed(() => this.selectedDuration());

  readonly currentSavings = computed(() => {
    const userData = this.budgetStore.userData();
    if (!userData) return 0;
    const balance = Number(userData.accountBalance);
    return balance > 0 ? balance : 0;
  });

  readonly remainingToSave = computed(() => {
    return Math.max(0, this.data().targetAmount - this.currentSavings());
  });

  readonly recommendedMonthlyContribution = computed(() => {
    const remaining = this.remainingToSave();
    const months = this.targetMonths();
    if (months <= 0) return 0;
    return Math.ceil(remaining / months);
  });

  readonly isPlanFeasible = computed(() => {
    const contribution = this.recommendedMonthlyContribution();
    const remainingBudget = this.data().remainingBudget;

    if (this.data().hasDebtRecoveryPlan) {
      const maxContribution = Math.min(remainingBudget * 0.1, 50);
      return contribution <= maxContribution;
    }

    return contribution <= remainingBudget * 0.3;
  });

  readonly minimumContribution = computed(() => {
    if (!this.data().hasDebtRecoveryPlan) return 0;
    return Math.min(10, this.data().remainingBudget * 0.05);
  });

  readonly maximumContribution = computed(() => {
    const remainingBudget = this.data().remainingBudget;
    if (this.data().hasDebtRecoveryPlan) {
      return Math.min(remainingBudget * 0.1, 50);
    }
    return remainingBudget * 0.3;
  });

  readonly planSections = computed((): PlanSection[] => [
    { id: 'plan-info', label: 'Fonctionnement', icon: 'info', visible: true },
    {
      id: 'plan-next-step',
      label: 'Prochaine étape',
      icon: 'event_available',
      visible: this.planInfo().daysUntilStart >= 0,
    },
    { id: 'plan-situation', label: 'Votre situation', icon: 'account_balance', visible: true },
    { id: 'plan-strategy', label: 'Stratégie', icon: 'lightbulb', visible: true },
    { id: 'plan-contribution', label: 'Contribution', icon: 'savings', visible: true },
    { id: 'plan-evolution', label: 'Évolution', icon: 'flag', visible: true },
    { id: 'plan-tips', label: 'Conseils', icon: 'tips_and_updates', visible: true },
  ]);

  // Info cards for PlanInfoSection
  readonly infoCards = computed((): InfoCard[] => [
    {
      icon: 'savings',
      title: 'Objectif: 3 mois de salaire',
      description:
        "Vous allez constituer un fonds d'urgence équivalent à 3 mois de votre salaire net. Cette épargne vous protège en cas d'imprévu.",
    },
    {
      icon: 'calendar_today',
      title: 'Contribution mensuelle',
      description:
        'Une somme est automatiquement calculée à chaque paie. Vous pouvez ajuster cette contribution en fonction de votre situation.',
    },
    {
      icon: 'shield',
      title: 'Sécurité financière',
      description:
        "Ce fonds d'urgence est votre filet de sécurité. Une fois atteint, vous pourrez vous concentrer sur d'autres objectifs.",
    },
  ]);

  // Situation metrics for PlanSituationSection
  readonly situationMetrics = computed((): SituationMetric[] => [
    {
      icon: 'flag',
      label: "Objectif d'épargne",
      value: this.data().targetAmount,
      currency: true,
      subtitle: '3 mois de salaire',
      progress: Math.min(100, (this.currentSavings() / this.data().targetAmount) * 100),
    },
    {
      icon: 'savings',
      label: 'Épargne actuelle',
      value: this.currentSavings(),
      currency: true,
      subtitle: `Reste à épargner: ${this.remainingToSave().toLocaleString('fr-FR')}€`,
      isNegative: false,
    },
    {
      icon: 'account_balance_wallet',
      label: 'Revenus mensuels',
      value: this.data().monthlyIncome,
      currency: true,
      subtitle: `Charges fixes: ${this.data().fixedExpenses.toLocaleString('fr-FR')}€`,
    },
    {
      icon: 'wallet',
      label: 'Budget disponible',
      value: this.data().remainingBudget,
      currency: true,
      subtitle: this.data().hasDebtRecoveryPlan ? '⚠️ Plan de redressement actif' : '',
      isNegative: this.data().remainingBudget < 0,
    },
  ]);

  // Strategy details for PlanStrategySection
  readonly strategyDetails = computed(() => [
    { icon: 'calendar_today', label: 'Durée du plan', value: `${this.targetMonths()} mois` },
    {
      icon: 'flag',
      label: 'Objectif final',
      value: `${this.data().targetAmount.toLocaleString('fr-FR')}€`,
    },
    {
      icon: 'trending_up',
      label: 'Épargne actuelle',
      value: `${this.currentSavings().toLocaleString('fr-FR')}€`,
    },
    {
      icon: 'account_balance_wallet',
      label: 'Reste à épargner',
      value: `${this.remainingToSave().toLocaleString('fr-FR')}€`,
    },
  ]);

  // Monthly targets
  readonly monthlyTargets = computed((): MonthlySavingsTarget[] => {
    const targets: MonthlySavingsTarget[] = [];
    const targetAmount = this.data().targetAmount;
    const monthlyContribution = this.recommendedMonthlyContribution();
    const minContribution = this.data().hasDebtRecoveryPlan ? this.minimumContribution() : 0;
    const maxContribution = this.maximumContribution();
    let currentAmount = this.currentSavings();
    const planStartDate = this.planInfo().startDate;

    for (let i = 1; i <= this.targetMonths(); i++) {
      const startDate = new Date(planStartDate);
      startDate.setMonth(startDate.getMonth() + i - 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const startDateStr = startDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined,
      });
      const endDateStr = endDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const monthName = `${startDateStr} - ${endDateStr}`;

      const requiredContribution = Math.max(
        minContribution,
        Math.min(maxContribution, monthlyContribution)
      );
      const newAmount = Math.min(targetAmount, currentAmount + requiredContribution);
      const actualContribution = newAmount - currentAmount;

      targets.push({
        month: i,
        monthName,
        startAmount: currentAmount,
        endAmount: newAmount,
        contribution: actualContribution,
        isAchievable:
          actualContribution >= minContribution && actualContribution <= maxContribution,
      });

      currentAmount = newAmount;
      if (currentAmount >= targetAmount) break;
    }

    return targets;
  });

  ngOnInit(): void {
    const remainingToSave = this.remainingToSave();
    const maxMonthlyContribution = this.data().hasDebtRecoveryPlan
      ? Math.min(50, this.data().remainingBudget * 0.1)
      : this.data().remainingBudget * 0.3;

    if (maxMonthlyContribution > 0) {
      const recommendedMonths = Math.ceil(remainingToSave / maxMonthlyContribution);
      this.selectedDuration.set(Math.max(3, Math.min(36, recommendedMonths)));
    } else {
      this.selectedDuration.set(36);
    }
  }

  calculateDurationFromContribution(contribution: number): number {
    const remainingToSave = this.remainingToSave();
    if (contribution <= 0) return 36;
    return Math.max(3, Math.min(36, Math.ceil(remainingToSave / contribution)));
  }

  updateDuration(value: number): void {
    this.selectedDuration.set(value);
    this.adjustPlan.emit(value);
  }

  scrollToContribution(): void {
    this.contributionSection?.nativeElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  adoptPlan(): void {
    const planInfo = this.planInfo();

    this.acceptPlan.emit({
      duration: this.targetMonths(),
      monthlyContribution: this.recommendedMonthlyContribution(),
      targetAmount: this.data().targetAmount,
      adopted: true,
    });

    const storeTargets: MonthlyTarget[] = this.monthlyTargets().map(target => ({
      month: target.month,
      monthName: target.monthName,
      startOverdraft: 0,
      endOverdraft: 0,
      availableBudget: target.contribution,
      dailyBudget: target.contribution / 30,
      overdraftReduction: 0,
      isAchievable: target.isAchievable,
    }));

    this.planStore.createPlan({
      type: 'savings',
      durationMonths: this.targetMonths(),
      monthlyBudget: this.recommendedMonthlyContribution(),
      dailyBudget: 0,
      paydayDay: this.data().paydayDay || 1,
      startDate: planInfo.startDate.toISOString(),
      targets: storeTargets,
      overdraftAmount: 0,
      remainingBudget: this.data().remainingBudget,
      monthlyIncome: this.data().monthlyIncome,
    });

    this.storageService.savePlanState({
      activePlan: this.planStore.activePlan(),
      pastPlans: this.planStore.pastPlans(),
    });

    const targetAmountFormatted = this.data().targetAmount.toLocaleString('fr-FR');
    const monthlyContributionFormatted =
      this.recommendedMonthlyContribution().toLocaleString('fr-FR');
    const hasDebtPlan = this.data().hasDebtRecoveryPlan;

    const alertMessage = hasDebtPlan
      ? `Plan d'épargne adopté et sauvegardé ! 🎯\n\n💰 Objectif : ${targetAmountFormatted}€ sur ${this.targetMonths()} mois\n📅 Contribution mensuelle : ${monthlyContributionFormatted}€\n⚠️ Un plan de redressement est actif : la contribution est ajustée à un minimum\n\n✅ Vous pourrez augmenter la contribution une fois le découvert remboursé !`
      : `Plan d'épargne adopté et sauvegardé ! 🎯\n\n💰 Objectif : ${targetAmountFormatted}€ sur ${this.targetMonths()} mois\n📅 Contribution mensuelle : ${monthlyContributionFormatted}€\n\n🚀 Objectif atteindre : ${planInfo.endDateFormatted}`;

    alert(alertMessage);
  }
}
