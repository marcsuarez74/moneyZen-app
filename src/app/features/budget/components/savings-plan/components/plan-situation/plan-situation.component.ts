import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-plan-situation',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule, MatCardModule, MatProgressBarModule],
  template: `
    <div id="plan-situation" class="situation-section">
      <h3>
        <mat-icon>account_balance</mat-icon>
        Votre situation actuelle
      </h3>

      <div class="situation-grid">
        <mat-card class="situation-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>flag</mat-icon>
            <mat-card-title>Objectif d'épargne</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="amount-display">
              <span class="amount">{{ targetAmount() | currency: 'EUR' }}</span>
              <span class="label">3 mois de salaire</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="progressPercent()"></mat-progress-bar>
            <div class="progress-text">{{ progressPercent() | number: '1.0-0' }}% atteint</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="situation-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>savings</mat-icon>
            <mat-card-title>Épargne actuelle</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="amount-display">
              <span class="amount" [class.positive]="currentSavings() > 0">
                {{ currentSavings() | currency: 'EUR' }}
              </span>
              <span class="label">déjà épargné</span>
            </div>
            <div class="detail">
              Reste à épargner: <strong>{{ remainingToSave() | currency: 'EUR' }}</strong>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="situation-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>account_balance_wallet</mat-icon>
            <mat-card-title>Revenus mensuels</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="amount-display">
              <span class="amount">{{ monthlyIncome() | currency: 'EUR' }}</span>
              <span class="label">salaire net</span>
            </div>
            <div class="detail">
              Charges fixes: <strong>{{ fixedExpenses() | currency: 'EUR' }}</strong>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="situation-card" [class.warning]="remainingBudget() < 0">
          <mat-card-header>
            <mat-icon mat-card-avatar>wallet</mat-icon>
            <mat-card-title>Budget disponible</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="amount-display">
              <span class="amount" [class.negative]="remainingBudget() < 0">
                {{ remainingBudget() | currency: 'EUR' }}
              </span>
              <span class="label">reste à vivre</span>
            </div>
            <div class="detail" *ngIf="hasDebtRecoveryPlan()">⚠️ Plan de redressement actif</div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .situation-section {
        padding: 24px 0;
      }

      h3 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 24px 0;
        color: var(--mat-sys-on-surface);
        font-size: 1.25rem;
        font-weight: 600;

        mat-icon {
          color: var(--mat-sys-primary);
        }
      }

      .situation-grid {
        display: grid;
        gap: 16px;

        @media (min-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .situation-card {
        mat-card-header {
          padding-bottom: 8px;

          mat-icon {
            color: var(--mat-sys-primary);
            font-size: 28px;
            width: 28px;
            height: 28px;
          }

          mat-card-title {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--mat-sys-on-surface-variant);
          }
        }

        mat-card-content {
          padding-top: 8px;
        }

        &.warning {
          border: 2px solid var(--mat-sys-error);
        }
      }

      .amount-display {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;

        .amount {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--mat-sys-on-surface);

          &.positive {
            color: var(--mat-sys-tertiary);
          }

          &.negative {
            color: var(--mat-sys-error);
          }
        }

        .label {
          font-size: 0.875rem;
          color: var(--mat-sys-on-surface-variant);
        }
      }

      .progress-text {
        margin-top: 8px;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        text-align: center;
      }

      .detail {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--mat-sys-outline-variant);

        strong {
          color: var(--mat-sys-on-surface);
        }
      }

      mat-progress-bar {
        height: 8px;
        border-radius: 4px;
      }
    `,
  ],
})
export class PlanSituationComponent {
  readonly targetAmount = input.required<number>();
  readonly currentSavings = input.required<number>();
  readonly remainingToSave = input.required<number>();
  readonly monthlyIncome = input.required<number>();
  readonly fixedExpenses = input.required<number>();
  readonly remainingBudget = input.required<number>();
  readonly hasDebtRecoveryPlan = input.required<boolean>();

  readonly progressPercent = () => {
    const target = this.targetAmount();
    const current = this.currentSavings();
    if (target <= 0) return 0;
    return Math.min(100, (current / target) * 100);
  };
}
