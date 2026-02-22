import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, CurrencyPipe],
  template: `
    <mat-card class="stat-card" [class.positive]="isPositive()" [class.negative]="isNegative()">
      <mat-card-content>
        <div class="stat-header">
          <mat-icon class="stat-icon" [style.color]="iconColor()">{{ icon() }}</mat-icon>
          <span class="stat-label">{{ label() }}</span>
        </div>
        <div class="stat-value" [style.color]="valueColor()">
          {{ value() | currency:'EUR':'symbol':'1.2-2' }}
        </div>
        <div class="stat-subtitle" *ngIf="subtitle()">
          {{ subtitle() }}
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stat-card {
      padding: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .stat-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .stat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .stat-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
    }
  `]
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<string>();
  readonly subtitle = input<string>('');
  readonly iconColor = input<string>('');
  readonly valueColor = input<string>('');
  readonly isPositive = input<boolean>(false);
  readonly isNegative = input<boolean>(false);
}
