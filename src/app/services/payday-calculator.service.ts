import { Injectable } from '@angular/core';

export interface PaydayInfo {
  lastPayday: Date;
  nextPayday: Date;
  daysUntilPayday: number;
  daysSincePayday: number;
  currentDayOfMonth: number;
  daysInCurrentMonth: number;
  monthProgressPercent: number; // 0-100%, progression du mois
  dailyBudget: number; // Budget quotidien théorique
  actualDailyBudget: number; // Budget quotidien réel pour les jours restants
  remainingDaysInMonth: number;
  isAfterPayday: boolean;
  isEndOfMonth: boolean; // Si on est après le 20 du mois
}

@Injectable({
  providedIn: 'root'
})
export class PaydayCalculatorService {
  
  /**
   * Calcule toutes les informations relatives à la paie
   */
  calculatePaydayInfo(salary: number, paydayDay: number, remainingBudget: number): PaydayInfo {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    // Nombre de jours dans le mois courant
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Date de paie du mois courant
    const thisMonthPayday = new Date(currentYear, currentMonth, paydayDay);
    
    // Si on est après la paie du mois, la prochaine est le mois prochain
    let nextPayday: Date;
    let lastPayday: Date;
    
    if (currentDay >= paydayDay) {
      // On est après la paie, la prochaine est le mois prochain
      nextPayday = new Date(currentYear, currentMonth + 1, paydayDay);
      lastPayday = thisMonthPayday;
    } else {
      // On est avant la paie, la prochaine est ce mois-ci
      nextPayday = thisMonthPayday;
      lastPayday = new Date(currentYear, currentMonth - 1, paydayDay);
    }
    
    // Calcul des jours
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysUntilPayday = Math.ceil((nextPayday.getTime() - today.getTime()) / millisecondsPerDay);
    const daysSincePayday = Math.floor((today.getTime() - lastPayday.getTime()) / millisecondsPerDay);
    
    // Progression du mois (0-100%)
    const monthProgressPercent = Math.round((currentDay / daysInCurrentMonth) * 100);
    
    // Jours restants dans le mois (de maintenant jusqu'à la fin du mois)
    const remainingDaysInMonth = daysInCurrentMonth - currentDay;
    
    // Budget quotidien théorique (si on répartissait équitablement sur tout le mois)
    const dailyBudget = daysInCurrentMonth > 0 ? remainingBudget / daysInCurrentMonth : remainingBudget;
    
    // Budget quotidien réel pour les jours restants (plus pertinent)
    const actualDailyBudget = remainingDaysInMonth > 0 
      ? remainingBudget / remainingDaysInMonth 
      : remainingBudget;
    
    return {
      lastPayday,
      nextPayday,
      daysUntilPayday,
      daysSincePayday,
      currentDayOfMonth: currentDay,
      daysInCurrentMonth,
      monthProgressPercent,
      dailyBudget,
      actualDailyBudget,
      remainingDaysInMonth,
      isAfterPayday: currentDay >= paydayDay,
      isEndOfMonth: currentDay >= 20 // On considère qu'après le 20, c'est la fin du mois
    };
  }
  
  /**
   * Formate le nombre de jours avant paie de façon lisible
   */
  formatDaysUntilPayday(days: number): string {
    if (days === 0) return "Aujourd'hui !";
    if (days === 1) return "Demain";
    if (days < 7) return `Dans ${days} jours`;
    if (days < 14) return "Dans une semaine";
    if (days < 30) return `Dans ${Math.floor(days / 7)} semaines`;
    return `Dans ${Math.floor(days / 30)} mois`;
  }
  
  /**
   * Calcule si le budget est serré en fonction des jours restants
   */
  isTightBudget(remainingBudget: number, daysUntilPayday: number): boolean {
    const dailyBudget = remainingBudget / daysUntilPayday;
    // Si moins de 20€ par jour, on considère que c'est serré
    return dailyBudget < 20 && remainingBudget > 0;
  }
  
  /**
   * Génère un message personnalisé selon la situation et la date actuelle
   */
  getPaydayMessage(paydayInfo: PaydayInfo, remainingBudget: number): string {
    if (remainingBudget < 0) {
      return "Votre budget est en négatif. Ne faites aucune dépense non essentielle !";
    }
    
    const { monthProgressPercent, remainingDaysInMonth, daysUntilPayday, actualDailyBudget } = paydayInfo;
    
    // Si on est à la fin du mois (après le 20)
    if (monthProgressPercent >= 66) {
      if (daysUntilPayday <= 3) {
        return `La paie arrive dans ${daysUntilPayday} jour${daysUntilPayday > 1 ? 's' : ''} ! Plus que ${remainingDaysInMonth} jour${remainingDaysInMonth > 1 ? 's' : ''} à tenir.`;
      }
      
      if (actualDailyBudget < 15) {
        return `Attention : mois presque fini (${monthProgressPercent}%) et il ne vous reste que ${actualDailyBudget.toFixed(0)}€/jour. Tenez bon !`;
      }
      
      return `${monthProgressPercent}% du mois écoulé - ${remainingDaysInMonth} jours restants avec ${actualDailyBudget.toFixed(0)}€/jour.`;
    }
    
    // Si on est au milieu du mois (entre 10 et 20)
    if (monthProgressPercent >= 33 && monthProgressPercent < 66) {
      if (actualDailyBudget < 20) {
        return `Milieu de mois atteint (${monthProgressPercent}%). Budget serré : ${actualDailyBudget.toFixed(0)}€/jour pour les ${remainingDaysInMonth} jours restants.`;
      }
      return `Nous sommes le ${paydayInfo.currentDayOfMonth}, mois à ${monthProgressPercent}%. Budget : ${actualDailyBudget.toFixed(0)}€/jour.`;
    }
    
    // Début du mois (avant le 10)
    if (monthProgressPercent < 33) {
      if (actualDailyBudget < 25) {
        return `Début de mois (${monthProgressPercent}%) mais budget déjà serré : ${actualDailyBudget.toFixed(0)}€/jour.`;
      }
      return `Début de mois (${monthProgressPercent}%). Vous avez ${actualDailyBudget.toFixed(0)}€/jour pour les ${remainingDaysInMonth} jours restants.`;
    }
    
    return `Budget disponible : ${actualDailyBudget.toFixed(0)}€ par jour jusqu'à la fin du mois.`;
  }
  
  /**
   * Calcule les charges à venir dans le mois
   */
  getUpcomingCharges(expenses: any[], _currentDay: number): { total: number; charges: any[] } {
    // Charges mensuelles non encore prélevées (on suppose qu'elles sont prélevées entre le 1er et le 28)
    const upcomingCharges = expenses.filter(e => {
      if (e.frequency !== 'monthly') return false;
      // On suppose que les charges fixes sont prélevées entre le 1er et le 28
      // Si on est avant le jour présumé de prélèvement, c'est à venir
      return true; // Simplifié - à adapter selon les vraies dates
    });
    
    const total = upcomingCharges.reduce((sum, e) => sum + e.monthlyEquivalent, 0);
    
    return { total, charges: upcomingCharges };
  }
}
