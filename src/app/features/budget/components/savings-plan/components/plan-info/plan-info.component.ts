import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { SavingsPlanInfo } from '../../savings-plan.component';

@Component({
  selector: 'app-plan-info',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatExpansionModule],
  template: `
    <div id="plan-info" class="info-section">
      <h3>
        <mat-icon>info</mat-icon>
        Comment fonctionne ce plan ?
      </h3>

      <div class="info-cards">
        <div class="info-card">
          <div class="card-icon">
            <mat-icon>savings</mat-icon>
          </div>
          <div class="card-content">
            <h4>Objectif: 3 mois de salaire</h4>
            <p>
              Vous allez constituer un fonds d'urgence équivalent à 3 mois de votre salaire net.
              Cette épargne vous protège en cas de imprévu (perte d'emploi, dépense inattendue).
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-icon">
            <mat-icon>calendar_today</mat-icon>
          </div>
          <div class="card-content">
            <h4>Contribution mensuelle</h4>
            <p>
              Une somme est automatiquement calculée à chaque paie. Vous pouvez ajuster cette
              contribution en fonction de votre situation.
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="card-icon">
            <mat-icon>shield</mat-icon>
          </div>
          <div class="card-content">
            <h4>Sécurité financière</h4>
            <p>
              Ce fonds d'urgence est votre filet de sécurité. Une fois atteint, vous pourrez vous
              concentrer sur d'autres objectifs d'épargne plus sereinement.
            </p>
          </div>
        </div>
      </div>

      @if (hasDebtRecoveryPlan()) {
        <div class="alert-box info">
          <mat-icon>info</mat-icon>
          <div>
            <strong>Plan de redressement actif</strong>
            <p>
              Un plan de redressement est actuellement en cours. Votre contribution mensuelle est
              ajustée au minimum possible pour ne pas compromettre votre remontée à zéro. Vous
              pourrez augmenter cette contribution une fois le découvert remboursé.
            </p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .info-section {
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

      .info-cards {
        display: grid;
        gap: 16px;
        margin-bottom: 24px;

        @media (min-width: 768px) {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      .info-card {
        display: flex;
        gap: 16px;
        padding: 20px;
        background: var(--mat-sys-surface-container);
        border-radius: 12px;
        border: 1px solid var(--mat-sys-outline-variant);

        .card-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: var(--mat-sys-primary-container);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          mat-icon {
            color: var(--mat-sys-primary);
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
        }

        .card-content {
          flex: 1;

          h4 {
            margin: 0 0 8px 0;
            color: var(--mat-sys-on-surface);
            font-size: 1rem;
            font-weight: 600;
          }

          p {
            margin: 0;
            color: var(--mat-sys-on-surface-variant);
            font-size: 0.875rem;
            line-height: 1.5;
          }
        }
      }

      .alert-box {
        display: flex;
        gap: 16px;
        padding: 20px;
        border-radius: 16px;
        align-items: flex-start;

        &.info {
          background: var(--mat-sys-info-container);
          border: 1px solid var(--mat-sys-info);
        }

        mat-icon {
          color: var(--mat-sys-info);
          font-size: 28px;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }

        strong {
          color: var(--mat-sys-on-surface);
          display: block;
          margin-bottom: 8px;
        }

        p {
          margin: 0;
          color: var(--mat-sys-on-surface-variant);
          font-size: 0.875rem;
          line-height: 1.5;
        }
      }
    `,
  ],
})
export class PlanInfoComponent {
  readonly planInfo = input.required<SavingsPlanInfo>();
  readonly hasDebtRecoveryPlan = input<boolean>(false);
}
