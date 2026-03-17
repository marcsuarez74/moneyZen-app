import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-plan-strategy',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule, MatCardModule],
  template: `
    <div id="plan-strategy" class="strategy-section">
      <h3>
        <mat-icon>lightbulb</mat-icon>
        Stratégie recommandée
      </h3>

      <div class="strategy-cards">
        <mat-card class="strategy-card primary">
          <mat-card-content>
            <div class="strategy-header">
              <mat-icon>savings</mat-icon>
              <span class="strategy-label">Contribution mensuelle recommandée</span>
            </div>
            <div class="strategy-value">
              {{ recommendedMonthlyContribution() | currency: 'EUR' }}
            </div>
            <span class="strategy-detail">
              Pour atteindre {{ targetAmount() | currency: 'EUR' }} en {{ targetMonths() }} mois
            </span>
          </mat-card-content>
        </mat-card>

        <div class="strategy-details-grid">
          <div class="detail-item">
            <mat-icon>calendar_today</mat-icon>
            <div class="detail-content">
              <span class="detail-label">Durée du plan</span>
              <span class="detail-value">{{ targetMonths() }} mois</span>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>flag</mat-icon>
            <div class="detail-content">
              <span class="detail-label">Objectif final</span>
              <span class="detail-value">{{ targetAmount() | currency: 'EUR' }}</span>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>trending_up</mat-icon>
            <div class="detail-content">
              <span class="detail-label">Épargne actuelle</span>
              <span class="detail-value">{{ currentSavings() | currency: 'EUR' }}</span>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>account_balance_wallet</mat-icon>
            <div class="detail-content">
              <span class="detail-label">Reste à épargner</span>
              <span class="detail-value">{{ remainingToSave() | currency: 'EUR' }}</span>
            </div>
          </div>
        </div>

        <mat-card
          class="feasibility-card"
          [class.feasible]="isPlanFeasible()"
          [class.challenging]="!isPlanFeasible()"
        >
          <mat-card-content>
            <div class="feasibility-header">
              <mat-icon>{{ isPlanFeasible() ? 'check_circle' : 'warning' }}</mat-icon>
              <span>{{ isPlanFeasible() ? 'Plan réalisable' : 'Plan ambitieux' }}</span>
            </div>
            <p class="feasibility-text">
              @if (isPlanFeasible()) {
                Cette contribution mensuelle respecte votre budget et est compatible avec votre
                situation actuelle.
              } @else {
                Cette contribution mensuelle dépasse votre capacité actuelle. Elle sera
                automatiquement ajustée au maximum possible.
              }
            </p>
          </mat-card-content>
        </mat-card>

        @if (hasDebtRecoveryPlan()) {
          <div class="debt-warning">
            <mat-icon color="warn">warning</mat-icon>
            <div class="warning-content">
              <strong>Plan de redressement actif</strong>
              <p>
                Votre contribution mensuelle est limitée pour ne pas affecter votre remontée à zéro.
                Maximum: {{ maximumContribution() | currency: 'EUR' }}/mois
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .strategy-section {
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

      .strategy-cards {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .strategy-card {
        &.primary {
          background: var(--mat-sys-primary-container);
          border: 1px solid var(--mat-sys-primary);

          mat-card-content {
            padding: 24px;
          }

          .strategy-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;

            mat-icon {
              color: var(--mat-sys-primary);
              font-size: 28px;
              width: 28px;
              height: 28px;
            }

            .strategy-label {
              color: var(--mat-sys-on-primary-container);
              font-size: 0.875rem;
              font-weight: 500;
            }
          }

          .strategy-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--mat-sys-primary);
            margin-bottom: 8px;
          }

          .strategy-detail {
            color: var(--mat-sys-on-primary-container);
            font-size: 0.875rem;
            opacity: 0.8;
          }
        }
      }

      .strategy-details-grid {
        display: grid;
        gap: 16px;

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: var(--mat-sys-surface-container);
        border-radius: 12px;
        border: 1px solid var(--mat-sys-outline-variant);

        mat-icon {
          color: var(--mat-sys-primary);
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .detail-label {
            font-size: 0.75rem;
            color: var(--mat-sys-on-surface-variant);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .detail-value {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--mat-sys-on-surface);
          }
        }
      }

      .feasibility-card {
        mat-card-content {
          padding: 16px 20px;
        }

        &.feasible {
          background: var(--mat-sys-tertiary-container);
          border: 1px solid var(--mat-sys-tertiary);

          .feasibility-header {
            mat-icon {
              color: var(--mat-sys-tertiary);
            }
          }
        }

        &.challenging {
          background: var(--mat-sys-error-container);
          border: 1px solid var(--mat-sys-error);

          .feasibility-header {
            mat-icon {
              color: var(--mat-sys-error);
            }
          }
        }

        .feasibility-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--mat-sys-on-surface);

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
        }

        .feasibility-text {
          margin: 0;
          color: var(--mat-sys-on-surface-variant);
          font-size: 0.875rem;
          line-height: 1.5;
        }
      }

      .debt-warning {
        display: flex;
        gap: 16px;
        padding: 16px 20px;
        background: var(--mat-sys-error-container);
        border-radius: 12px;
        border: 1px solid var(--mat-sys-error);

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }

        .warning-content {
          strong {
            color: var(--mat-sys-on-surface);
            display: block;
            margin-bottom: 4px;
          }

          p {
            margin: 0;
            color: var(--mat-sys-on-surface-variant);
            font-size: 0.875rem;
          }
        }
      }
    `,
  ],
})
export class PlanStrategyComponent {
  readonly targetAmount = input.required<number>();
  readonly currentSavings = input.required<number>();
  readonly remainingToSave = input.required<number>();
  readonly recommendedMonthlyContribution = input.required<number>();
  readonly targetMonths = input.required<number>();
  readonly isPlanFeasible = input.required<boolean>();
  readonly hasDebtRecoveryPlan = input.required<boolean>();
  readonly maximumContribution = input.required<number>();
}
