import {
  Component,
  input,
  output,
  computed,
  signal,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {
  PlanNavigationComponent,
  PlanSection,
} from '../../../../shared/components/plan-navigation/plan-navigation.component';

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

@Component({
  selector: 'app-savings-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    MatIconModule,
    MatSliderModule,
    MatCardModule,
    MatButtonModule,
    PlanNavigationComponent,
  ],
  templateUrl: './savings-plan.component.html',
  styleUrls: ['./savings-plan.component.scss'],
})
export class SavingsPlanComponent implements OnInit {
  @ViewChild('contributionSection') contributionSection!: ElementRef;

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

  readonly remainingToSave = computed(() => {
    return this.data().targetAmount;
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

  updateDuration(months: number): void {
    this.selectedDuration.set(months);
    this.adjustPlan.emit(months);
  }

  scrollToContribution(): void {
    this.contributionSection?.nativeElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  adoptPlan(): void {
    this.acceptPlan.emit({
      duration: this.targetMonths(),
      monthlyContribution: this.recommendedMonthlyContribution(),
      targetAmount: this.data().targetAmount,
      adopted: true,
    });

    const planInfo = this.planInfo();
    const targetAmountFormatted = this.data().targetAmount.toLocaleString('fr-FR');
    const monthlyContributionFormatted =
      this.recommendedMonthlyContribution().toLocaleString('fr-FR');

    alert(
      `Plan d'épargne adopté ! 🎯\n\n💰 Objectif : ${targetAmountFormatted}€\n📅 ${this.targetMonths()} mois\n💵 ${monthlyContributionFormatted}€/mois\n\n🚀 Objectif atteint le : ${planInfo.endDateFormatted}`
    );
  }
}
