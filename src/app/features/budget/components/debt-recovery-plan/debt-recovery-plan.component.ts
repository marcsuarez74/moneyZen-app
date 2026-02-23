import { Component, input, output, computed, signal, ViewChild, ElementRef, inject } from '@angular/core';
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

export interface RecoveryPlanData {
  overdraftAmount: number;
  monthlyIncome: number;
  fixedExpenses: number;
  remainingBudget: number;
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
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './debt-recovery-plan.component.html',
  styleUrls: ['./debt-recovery-plan.component.scss']
})
export class DebtRecoveryPlanComponent {
  @ViewChild('durationSection') durationSection!: ElementRef;
  @ViewChild('recoveryCard') recoveryCard!: ElementRef;

  private planStore = inject(PlanStore);
  private budgetStore = inject(BudgetStore);
  private storageService = inject(LocalStorageService);

  readonly data = input.required<RecoveryPlanData>();
  readonly acceptPlan = output<{ duration: number; monthlyBudget: number; dailyBudget: number; adopted: boolean }>();
  readonly adjustPlan = output<number>();

  readonly Math = Math;
  readonly selectedDuration = signal(6);
  readonly daysInMonth = signal(30);

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

    for (let i = 1; i <= this.targetMonths(); i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i - 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

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

  updateDuration(value: number): void {
    this.selectedDuration.set(value);
    this.adjustPlan.emit(value);
  }

  scrollToDuration(): void {
    this.durationSection?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  adoptPlan(): void {
    const userData = this.budgetStore.userData();

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
      targets: this.monthlyTargets()
    });

    // Persister dans le localStorage
    this.storageService.savePlanState({
      activePlan: this.planStore.activePlan(),
      pastPlans: this.planStore.pastPlans()
    });

    console.log('✅ Plan sauvegardé avec succès !');
    alert(`Plan adopté et sauvegardé ! Vous allez remonter votre découvert de ${this.data().overdraftAmount}€ sur ${this.targetMonths()} mois avec un budget de ${this.recommendedMonthlyBudget().toFixed(0)}€ par mois pour vos dépenses extra (${this.recommendedDailyBudget().toFixed(0)}€/jour). Le plan se mettra à jour automatiquement chaque mois après votre paie.`);
  }
}
