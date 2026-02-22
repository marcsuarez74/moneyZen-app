import { Component, input, output, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

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
    FormsModule,
    CurrencyPipe
  ],
  template: `
    <mat-card class="recovery-card" #recoveryCard>
      <mat-card-header>
        <div class="header-icon alert" mat-card-avatar>
          <mat-icon>trending_up</mat-icon>
        </div>
        <mat-card-title>Plan de redressement du découvert</mat-card-title>
        <mat-card-subtitle>
          Découvert actuel : {{ data().overdraftAmount | currency:'EUR' }}
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="situation-box">
          <h3>
            <mat-icon>account_balance</mat-icon>
            Votre situation actuelle
          </h3>
          <div class="situation-grid">
            <div class="situation-item negative">
              <span class="label">Découvert actuel</span>
              <span class="value">-{{ data().overdraftAmount | currency:'EUR' }}</span>
              <span class="sublabel">Objectif : remonter à zéro</span>
            </div>
            <div class="situation-item income">
              <span class="label">Revenus mensuels</span>
              <span class="value">{{ data().monthlyIncome | currency:'EUR' }}</span>
            </div>
            <div class="situation-item expenses">
              <span class="label">Charges fixes obligatoires</span>
              <span class="value">{{ data().fixedExpenses | currency:'EUR' }}</span>
            </div>
            <div class="situation-item remaining" [class.negative]="data().remainingBudget < 0">
              <span class="label">Reste à vivre actuel</span>
              <span class="value">{{ data().remainingBudget | currency:'EUR' }}</span>
              <span class="sublabel" *ngIf="data().remainingBudget < 0">⚠️ Vous dépensez plus que vous ne gagnez</span>
            </div>
          </div>
        </div>

        <div class="strategy-box">
          <h3>
            <mat-icon>lightbulb</mat-icon>
            Stratégie recommandée
          </h3>
          <div class="strategy-content">
            <div class="strategy-item primary">
              <mat-icon>savings</mat-icon>
              <div class="strategy-text">
                <span class="strategy-label">Budget mensuel disponible</span>
                <span class="strategy-value">{{ recommendedMonthlyBudget() | currency:'EUR' }}</span>
                <span class="strategy-detail">C'est ce que vous pouvez dépenser en extra ce mois-ci tout en remontant votre découvert</span>
              </div>
            </div>
            
            <div class="strategy-item">
              <mat-icon>calendar_today</mat-icon>
              <div class="strategy-text">
                <span class="strategy-label">Budget quotidien réaliste</span>
                <span class="strategy-value">{{ recommendedDailyBudget() | currency:'EUR' }}/jour</span>
                <span class="strategy-detail">Pour {{ daysInMonth() }} jours (alimentation, loisirs, imprévus...)</span>
              </div>
            </div>

            <div class="strategy-item" *ngIf="minimumRecoveryPerMonth() > 0">
              <mat-icon>trending_up</mat-icon>
              <div class="strategy-text">
                <span class="strategy-label">Minimum à "retrouver" par mois</span>
                <span class="strategy-value">{{ minimumRecoveryPerMonth() | currency:'EUR' }}</span>
                <span class="strategy-detail">Pour atteindre zéro en {{ targetMonths() }} mois</span>
              </div>
            </div>
          </div>
        </div>

        <div class="duration-section" #durationSection>
          <h3>
            <mat-icon>schedule</mat-icon>
            Durée de remontée
          </h3>
          <div class="duration-control">
            <mat-slider 
              [min]="minDuration()" 
              [max]="12" 
              [step]="1" 
              [discrete]="true"
              [showTickMarks]="true">
              <input matSliderThumb [(ngModel)]="selectedDuration" (ngModelChange)="updateDuration($event)">
            </mat-slider>
            <div class="duration-summary">
              <div class="duration-info">
                <span class="duration-number">{{ targetMonths() }} mois</span>
                <span class="duration-detail">
                  pour remonter à {{ estimatedFinalBalance() | currency:'EUR' }}
                </span>
              </div>
              <div class="monthly-impact" *ngIf="monthlyRecovery() > 0">
                <span class="impact-label">Votre découvert baisse de :</span>
                <span class="impact-value">
                  {{ monthlyRecovery() | currency:'EUR' }}/mois
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="targets-section">
          <h3>
            <mat-icon>flag</mat-icon>
            Évolution mois par mois
          </h3>
          <p class="targets-explanation">
            Suivez la progression de votre découvert en respectant les budgets ci-dessous :
          </p>
          
          <div class="targets-list">
            @for (target of monthlyTargets(); track target.month) {
              <div class="target-card" [class.achievable]="target.isAchievable" [class.difficult]="!target.isAchievable">
                <div class="target-header">
                  <div class="month-badge">M{{ target.month }}</div>
                  <span class="month-name">{{ target.monthName }}</span>
                  @if (!target.isAchievable) {
                    <mat-icon class="warning-icon" color="warn">warning</mat-icon>
                  }
                </div>
                
                <div class="target-body">
                  <div class="balance-track">
                    <div class="balance-point start">
                      <span class="point-label">Début</span>
                      <span class="point-value negative">-{{ target.startOverdraft | currency:'EUR' }}</span>
                    </div>
                    <mat-icon class="arrow">arrow_forward</mat-icon>
                    <div class="balance-point end">
                      <span class="point-label">Fin du mois</span>
                      @if (target.endOverdraft > 0) {
                        <span class="point-value negative">-{{ target.endOverdraft | currency:'EUR' }}</span>
                      } @else {
                        <span class="point-value zero">0 €</span>
                      }
                    </div>
                  </div>
                  
                  <div class="budget-box">
                    <div class="budget-row">
                      <mat-icon>shopping_cart</mat-icon>
                      <div class="budget-text">
                        <span class="budget-label">Ce mois vous pouvez dépenser :</span>
                        <span class="budget-amount">{{ target.availableBudget | currency:'EUR' }}</span>
                      </div>
                    </div>
                    <div class="budget-daily">
                      soit {{ target.dailyBudget | currency:'EUR' }}/jour en moyenne
                    </div>
                  </div>
                  
                  <div class="reduction-box" *ngIf="target.overdraftReduction > 0">
                    <span class="reduction-label">Votre découvert diminue de :</span>
                    <span class="reduction-value">{{ target.overdraftReduction | currency:'EUR' }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="summary-section">
          <h3>
            <mat-icon>tips_and_updates</mat-icon>
            Comment y arriver
          </h3>
          
          @if (hasDifficultMonths()) {
            <div class="alert-box">
              <mat-icon>warning</mat-icon>
              <div>
                <strong>Attention</strong>
                <p>Certaines mensualités seront difficiles avec ce budget. Envisagez {{ recommendedDuration() }} mois pour plus de confort.</p>
              </div>
            </div>
          }
          
          <ul class="tips-list">
            <li>
              <mat-icon>account_balance</mat-icon>
              <span><strong>Priorisez les charges fixes :</strong> Payez d'abord loyer, factures et crédits avant toute dépense extra</span>
            </li>
            <li>
              <mat-icon>restaurant</mat-icon>
              <span><strong>Budget alimentation :</strong> Prévoyez environ 40% de votre budget quotidien pour les courses ({{ (recommendedDailyBudget() * 0.4 * daysInMonth()) | currency:'EUR' }}/mois)</span>
            </li>
            <li>
              <mat-icon>credit_card_off</mat-icon>
              <span><strong>Évitez les dépenses impulsives :</strong> Attendez 48h avant tout achat non essentiel</span>
            </li>
            <li>
              <mat-icon>show_chart</mat-icon>
              <span><strong>Suivez vos dépenses :</strong> Notez chaque dépense pour rester dans le budget quotidien de {{ recommendedDailyBudget() | currency:'EUR' }}</span>
            </li>
            @if (data().remainingBudget < 0) {
              <li class="urgent">
                <mat-icon>priority_high</mat-icon>
                <span><strong>URGENT :</strong> Vos dépenses dépassent vos revenus de {{ Math.abs(data().remainingBudget) | currency:'EUR' }}/mois. Réduisez immédiatement vos charges fixes ou augmentez vos revenus.</span>
              </li>
            }
          </ul>
        </div>
      </mat-card-content>
      
      <mat-card-actions align="end">
        <button mat-stroked-button (click)="scrollToDuration()">
          <mat-icon>edit</mat-icon>
          Ajuster la durée
        </button>
        <button mat-raised-button color="primary" (click)="adoptPlan()">
          <mat-icon>check</mat-icon>
          J'adhère à ce plan sur {{ targetMonths() }} mois
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .recovery-card {
      border-left: 4px solid #f44336;
      margin-bottom: 24px;
    }
    
    .header-icon {
      background: linear-gradient(135deg, #f44336, #ff5722);
      display: flex;
      align-items: center;
      justify-content: center;
      
      mat-icon {
        color: white;
      }
    }
    
    h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      margin: 24px 0 16px 0;
    }
    
    .situation-box {
      background: var(--surface-variant);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .situation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .situation-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .label {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
      }
      
      .value {
        font-size: 24px;
        font-weight: 700;
      }
      
      .sublabel {
        font-size: 12px;
        color: var(--text-secondary);
        font-style: italic;
      }
      
      &.negative .value { color: #f44336; }
      &.income .value { color: #4caf50; }
      &.expenses .value { color: #ff9800; }
    }
    
    .strategy-box {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1));
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid rgba(33, 150, 243, 0.3);
    }
    
    .strategy-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .strategy-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: var(--surface);
      border-radius: 8px;
      
      &.primary {
        background: rgba(33, 150, 243, 0.15);
        border: 2px solid #2196f3;
      }
      
      mat-icon {
        color: #2196f3;
        flex-shrink: 0;
      }
      
      .strategy-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .strategy-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        
        .strategy-value {
          font-size: 24px;
          font-weight: 700;
          color: #2196f3;
        }
        
        .strategy-detail {
          font-size: 13px;
          color: var(--text-secondary);
          font-style: italic;
        }
      }
    }
    
    .duration-control {
      background: var(--surface-variant);
      padding: 20px;
      border-radius: 12px;
      
      mat-slider {
        width: 100%;
      }
      
      .duration-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
        flex-wrap: wrap;
        gap: 12px;
        
        .duration-info {
          .duration-number {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
            display: block;
          }
          
          .duration-detail {
            font-size: 14px;
            color: var(--text-secondary);
          }
        }
        
        .monthly-impact {
          text-align: right;
          
          .impact-label {
            font-size: 13px;
            color: var(--text-secondary);
            display: block;
          }
          
          .impact-value {
            font-size: 18px;
            font-weight: 600;
            color: #4caf50;
          }
        }
      }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    
    .targets-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .target-card {
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      
      &.achievable {
        border-color: #4caf50;
        background: rgba(76, 175, 80, 0.05);
      }
      
      &.difficult {
        border-color: #f44336;
        background: rgba(244, 67, 54, 0.05);
      }
      
      .target-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        
        .month-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        .month-name {
          flex: 1;
          font-weight: 600;
        }
      }
      
      .balance-track {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        background: var(--surface);
        border-radius: 8px;
        margin-bottom: 12px;
        
        .balance-point {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .point-label {
            font-size: 11px;
            color: var(--text-secondary);
            text-transform: uppercase;
          }
          
          .point-value {
            font-size: 16px;
            font-weight: 600;
            
            &.negative { color: #f44336; }
            &.zero { color: #4caf50; }
          }
        }
      }
      
      .budget-box {
        background: rgba(33, 150, 243, 0.1);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        
        .budget-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          mat-icon {
            color: #2196f3;
          }
          
          .budget-text {
            display: flex;
            flex-direction: column;
            
            .budget-label {
              font-size: 12px;
              color: var(--text-secondary);
            }
            
            .budget-amount {
              font-size: 20px;
              font-weight: 700;
              color: #2196f3;
            }
          }
        }
        
        .budget-daily {
          font-size: 12px;
          color: var(--text-secondary);
          font-style: italic;
          padding-left: 36px;
        }
      }
      
      .reduction-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 8px;
        
        .reduction-label {
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .reduction-value {
          font-size: 16px;
          font-weight: 600;
          color: #4caf50;
        }
      }
    }
    
    .tips-list {
      list-style: none;
      padding: 0;
      
      li {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: var(--surface-variant);
        border-radius: 8px;
        margin-bottom: 8px;
        
        &.urgent {
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid #f44336;
        }
        
        mat-icon {
          color: #4caf50;
          flex-shrink: 0;
        }
      }
    }
    
    mat-card-actions {
      padding: 16px;
      gap: 12px;
    }
  `]
})
export class DebtRecoveryPlanComponent {
  @ViewChild('durationSection') durationSection!: ElementRef;
  @ViewChild('recoveryCard') recoveryCard!: ElementRef;
  
  readonly data = input.required<RecoveryPlanData>();
  readonly acceptPlan = output<{ duration: number; monthlyBudget: number; dailyBudget: number; adopted: boolean }>();
  readonly adjustPlan = output<number>();
  
  readonly Math = Math;
  readonly selectedDuration = signal(6);
  readonly daysInMonth = signal(30); // Base sur 30 jours par mois
  
  readonly targetMonths = computed(() => this.selectedDuration());
  
  // Minimum pour survivre (courses basiques, transport, etc.)
  readonly minimumLivingCost = computed(() => {
    return Math.max(300, this.data().monthlyIncome * 0.15); // Minimum 300€ ou 15% du revenu
  });
  
  // Budget mensuel recommandé (ce qu'on peut dépenser en extra)
  readonly recommendedMonthlyBudget = computed(() => {
    const remaining = this.data().remainingBudget;
    const minRecovery = Math.ceil(this.data().overdraftAmount / this.targetMonths());
    
    // On doit au minimum réduire le découvert de minimumRecoveryPerMonth
    // Donc le budget disponible = reste à vivre - minimum à récupérer
    const availableBudget = remaining - minRecovery;
    
    // On s'assure qu'on a au moins le minimum pour vivre
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
    
    // Si on dépense le minimum pour vivre, combien on récupère ?
    const recovery = remaining - minLiving;
    return Math.max(0, recovery);
  });
  
  // Solde estimé à la fin du plan
  readonly estimatedFinalBalance = computed(() => {
    const totalRecovery = this.monthlyRecovery() * this.targetMonths();
    const finalOverdraft = Math.max(0, this.data().overdraftAmount - totalRecovery);
    return -finalOverdraft;
  });
  
  // Durée minimum (pour éviter de diviser par zéro ou d'avoir des trucs impossibles)
  readonly minDuration = computed(() => {
    if (this.data().remainingBudget <= 0) return 12; // Si déficit, on met 12 mois mini
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
      
      // Calcul du budget disponible ce mois-ci
      // On veut répartir la charge sur les mois restants
      const monthsLeft = this.targetMonths() - i + 1;
      const minRequiredRecovery = currentOverdraft / monthsLeft;
      
      // Budget disponible = reste à vivre - ce qu'on doit récupérer
      let availableBudget = remainingBudget - minRequiredRecovery;
      
      // On s'assure d'avoir au moins le minimum pour vivre
      availableBudget = Math.max(minLiving, availableBudget);
      
      // Combien on récupère réellement ce mois-ci
      const actualRecovery = remainingBudget - availableBudget;
      
      // Nouveau découvert
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
    
    // Durée pour avoir un budget quotidien confortable (min 15€/jour)
    const minDailyBudget = 15;
    const minMonthlyBudget = minDailyBudget * this.daysInMonth();
    
    // Solde disponible pour le découvert chaque mois
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
    this.acceptPlan.emit({
      duration: this.targetMonths(),
      monthlyBudget: this.recommendedMonthlyBudget(),
      dailyBudget: this.recommendedDailyBudget(),
      adopted: true
    });
    
    alert(`Plan adopté ! Vous allez remonter votre découvert de ${this.data().overdraftAmount}€ sur ${this.targetMonths()} mois avec un budget de ${this.recommendedMonthlyBudget().toFixed(0)}€ par mois pour vos dépenses extra (${this.recommendedDailyBudget().toFixed(0)}€/jour).`);
  }
}
