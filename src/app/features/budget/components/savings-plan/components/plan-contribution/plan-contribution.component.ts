import { Component, input, output, model } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plan-contribution',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatIconModule,
    MatCardModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  template: `
    <div id="plan-contribution" class="contribution-section">
      <h3>
        <mat-icon>savings</mat-icon>
        Gestion de la contribution
      </h3>

      <mat-card class="contribution-card">
        <mat-card-content>
          <div class="contribution-header">
            <span class="label">Contribution mensuelle</span>
            <span class="value">{{ contribution() | currency: 'EUR' }}</span>
          </div>

          <div class="slider-container">
            <div class="slider-labels">
              <span>Min: {{ minimumContribution() | currency: 'EUR' }}</span>
              <span>Max: {{ maximumContribution() | currency: 'EUR' }}</span>
            </div>
            <mat-slider
              [min]="minimumContribution()"
              [max]="maximumContribution()"
              [step]="10"
              [discrete]="true"
              [showTickMarks]="true"
              class="contribution-slider"
            >
              <input
                matSliderThumb
                [(ngModel)]="contribution"
                (ngModelChange)="contributionChange.emit($event)"
              />
            </mat-slider>
          </div>

          <div class="contribution-details">
            <div class="detail-row">
              <mat-icon>schedule</mat-icon>
              <span
                >Durée estimée: <strong>{{ estimatedDuration() }} mois</strong></span
              >
            </div>
            <div class="detail-row">
              <mat-icon>calendar_today</mat-icon>
              <span
                >Date d'accomplissement:
                <strong>{{
                  estimatedCompletionDate() | date: 'longDate' : '' : 'fr'
                }}</strong></span
              >
            </div>
          </div>

          @if (hasDebtRecoveryPlan()) {
            <div class="debt-notice">
              <mat-icon>info</mat-icon>
              <p>
                <strong>Contribution limitée</strong><br />
                Un plan de redressement est actif. Votre contribution est plafonnée à
                {{ maximumContribution() | currency: 'EUR' }}/mois pour ne pas compromettre votre
                remontée à zéro.
              </p>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <div class="contribution-tips">
        <h4>
          <mat-icon>tips_and_updates</mat-icon>
          Conseils pour épargner
        </h4>
        <ul>
          <li>
            <mat-icon>check_circle</mat-icon>
            <span>Automatisez votre épargne: virement automatique à chaque paie</span>
          </li>
          @if (!hasDebtRecoveryPlan()) {
            <li>
              <mat-icon>check_circle</mat-icon>
              <span>Commencez petit: même 50€/mois font une différence sur le long terme</span>
            </li>
          }
          <li>
            <mat-icon>check_circle</mat-icon>
            <span>Placez cette épargne sur un compte séparé pour éviter de la dépenser</span>
          </li>
          <li>
            <mat-icon>check_circle</mat-icon>
            <span>Ce fonds est pour les URGENCES uniquement (pas pour les achats impulsifs)</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .contribution-section {
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

      .contribution-card {
        margin-bottom: 24px;

        mat-card-content {
          padding: 24px;
        }
      }

      .contribution-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .label {
          font-size: 0.875rem;
          color: var(--mat-sys-on-surface-variant);
        }

        .value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--mat-sys-primary);
        }
      }

      .slider-container {
        margin-bottom: 20px;

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--mat-sys-on-surface-variant);
          margin-bottom: 8px;
        }

        .contribution-slider {
          width: 100%;
        }
      }

      .contribution-details {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid var(--mat-sys-outline-variant);

        .detail-row {
          display: flex;
          align-items: center;
          gap: 12px;

          mat-icon {
            color: var(--mat-sys-primary);
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          span {
            color: var(--mat-sys-on-surface-variant);

            strong {
              color: var(--mat-sys-on-surface);
            }
          }
        }
      }

      .debt-notice {
        display: flex;
        gap: 12px;
        margin-top: 20px;
        padding: 16px;
        background: var(--mat-sys-info-container);
        border-radius: 8px;
        border: 1px solid var(--mat-sys-info);

        mat-icon {
          color: var(--mat-sys-info);
          font-size: 24px;
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        p {
          margin: 0;
          color: var(--mat-sys-on-surface-variant);
          font-size: 0.875rem;
          line-height: 1.5;

          strong {
            color: var(--mat-sys-on-surface);
          }
        }
      }

      .contribution-tips {
        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          color: var(--mat-sys-on-surface);
          font-size: 1rem;
          font-weight: 600;

          mat-icon {
            color: var(--mat-sys-primary);
          }
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--mat-sys-outline-variant);

          &:last-child {
            border-bottom: none;
          }

          mat-icon {
            color: var(--mat-sys-tertiary);
            font-size: 20px;
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          span {
            color: var(--mat-sys-on-surface-variant);
            font-size: 0.875rem;
            line-height: 1.5;
          }
        }
      }
    `,
  ],
})
export class PlanContributionComponent {
  readonly contribution = model.required<number>();
  readonly minimumContribution = input.required<number>();
  readonly maximumContribution = input.required<number>();
  readonly hasDebtRecoveryPlan = input.required<boolean>();
  readonly estimatedDuration = input.required<number>();
  readonly estimatedCompletionDate = input.required<Date>();

  readonly contributionChange = output<number>();
}
