import { Injectable, inject } from '@angular/core';
import { PlanStore } from '../store/plan.store';
import { LocalStorageService } from './local-storage.service';
import { BudgetStore } from '../store/budget.store';
import { PaydayCalculatorService } from './payday-calculator.service';

@Injectable({
  providedIn: 'root'
})
export class PlanAutoUpdateService {
  private planStore = inject(PlanStore);
  private budgetStore = inject(BudgetStore);
  private storageService = inject(LocalStorageService);
  private paydayService = inject(PaydayCalculatorService);

  private checkInterval: any;
  private lastProcessedPayday: string | null = null;

  initialize(): void {
    this.loadSavedState();
    this.checkAndAdvancePlan();

    // Vérifier toutes les heures
    this.checkInterval = setInterval(() => {
      this.checkAndAdvancePlan();
    }, 60 * 60 * 1000);

    // Vérifier aussi au changement de date (quand l'app redevient active)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkAndAdvancePlan();
      }
    });
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private loadSavedState(): void {
    const savedState = this.storageService.loadPlanState();
    if (savedState) {
      // Convertir les dates string en objets Date
      const activePlan = savedState.activePlan ? {
        ...savedState.activePlan,
        createdAt: new Date(savedState.activePlan.createdAt),
        history: savedState.activePlan.history.map(h => ({
          ...h,
          completedAt: h.completedAt ? new Date(h.completedAt) : undefined
        }))
      } : null;

      const pastPlans = savedState.pastPlans.map(plan => ({
        ...plan,
        createdAt: new Date(plan.createdAt),
        history: plan.history.map(h => ({
          ...h,
          completedAt: h.completedAt ? new Date(h.completedAt) : undefined
        }))
      }));

      this.planStore.loadPlan(activePlan, pastPlans);

      // Restaurer le dernier jour de paie traité depuis le localStorage
      this.lastProcessedPayday = localStorage.getItem('last_processed_payday');
    }
  }

  private checkAndAdvancePlan(): void {
    const activePlan = this.planStore.activePlan();
    if (!activePlan?.isActive) return;

    const today = new Date();
    const currentDay = today.getDate();
    const paydayDay = activePlan.paydayDay;

    // Déterminer la date de paie du mois courant
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Si on est avant le jour de paie, la paie est ce mois-ci
    // Si on est après, la paie était ce mois-ci et la prochaine sera le mois prochain
    let paydayDate: Date;

    if (currentDay >= paydayDay) {
      // On est après la paie, donc la dernière paie était ce mois-ci
      paydayDate = new Date(currentYear, currentMonth, paydayDay);
    } else {
      // On est avant la paie, donc la dernière paie était le mois dernier
      paydayDate = new Date(currentYear, currentMonth - 1, paydayDay);
    }

    const paydayKey = paydayDate.toISOString().split('T')[0];

    // Vérifier si on a déjà traité cette paie
    if (this.lastProcessedPayday === paydayKey) {
      return;
    }

    // Vérifier si la dernière paie traitée est d'un mois différent
    if (this.lastProcessedPayday) {
      const lastProcessed = new Date(this.lastProcessedPayday);
      const currentProcessed = new Date(paydayKey);

      // Si les mois sont différents, c'est qu'on a passé une paie
      if (lastProcessed.getMonth() !== currentProcessed.getMonth() ||
          lastProcessed.getFullYear() !== currentProcessed.getFullYear()) {
        this.advanceToNextMonth(paydayDate);
      }
    } else {
      // Première initialisation - sauvegarder la paie courante sans avancer
      this.lastProcessedPayday = paydayKey;
      localStorage.setItem('last_processed_payday', paydayKey);
    }
  }

  private advanceToNextMonth(paydayDate: Date): void {
    const activePlan = this.planStore.activePlan();
    if (!activePlan) return;

    // Calculer les dépenses réelles du mois depuis le budget store
    const summary = this.budgetStore.budgetSummary();
    const actualSpending = summary?.totalExpenses || 0;

    // Compléter le mois courant
    this.planStore.completeCurrentMonth(
      actualSpending,
      `Avancement automatique - Jour de paie du ${paydayDate.toLocaleDateString('fr-FR')}`
    );

    // Sauvegarder l'état
    const newState = {
      activePlan: this.planStore.activePlan(),
      pastPlans: this.planStore.pastPlans()
    };
    this.storageService.savePlanState(newState);

    // Sauvegarder le jour de paie traité
    const paydayKey = paydayDate.toISOString().split('T')[0];
    this.lastProcessedPayday = paydayKey;
    localStorage.setItem('last_processed_payday', paydayKey);

    console.log(`✅ Plan avancé au mois ${activePlan.currentMonth + 1}/${activePlan.durationMonths}`);
  }

  // Méthode manuelle pour forcer l'avancement (pour debug ou utilisation manuelle)
  forceAdvance(): void {
    const today = new Date();
    this.advanceToNextMonth(today);
  }

  // Vérifier si une paie approche (dans les 3 jours)
  isPaydayApproaching(): boolean {
    const activePlan = this.planStore.activePlan();
    if (!activePlan?.isActive) return false;

    const userData = this.budgetStore.userData();
    if (!userData?.paydayDay) return false;

    const summary = this.budgetStore.budgetSummary();
    if (!summary) return false;

    const paydayInfo = this.paydayService.calculatePaydayInfo(
      userData.salary,
      userData.paydayDay,
      summary.remainingBudget
    );

    return paydayInfo.daysUntilPayday <= 3;
  }
}
