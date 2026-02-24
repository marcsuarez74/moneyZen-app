/**
 * Bouton d'export des données avec design fintech
 * Génère un ZIP de sauvegarde et le télécharge automatiquement
 */
import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackupService } from '../../../services/backup.service';

@Component({
  selector: 'app-backup-export-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <button 
      mat-button
      [class]="variant()"
      [disabled]="isExporting()"
      (click)="exportData()"
      [matTooltip]="tooltipText()"
      matTooltipPosition="above">
      @if (isExporting()) {
        <mat-spinner 
          diameter="20" 
          mode="indeterminate"
          color="primary">
        </mat-spinner>
        <span>Export...</span>
      } @else {
        <mat-icon>{{ icon() }}</mat-icon>
        @if (showLabel()) {
          <span>{{ label() }}</span>
        }
      }
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    button {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 12px;
      font-weight: 500;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.stroked {
        border: 1px solid var(--fintech-primary, #667eea);
        color: var(--fintech-primary, #667eea);
        background: transparent;

        &:hover {
          background: rgba(102, 126, 234, 0.1);
        }
      }

      &.raised {
        background: var(--gradient-fintech-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        &:hover {
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
          transform: translateY(-1px);
        }
      }

      &.icon-only {
        min-width: 40px;
        width: 40px;
        height: 40px;
        padding: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--fintech-text-secondary, #666666);

        &:hover {
          background: var(--fintech-surface-variant, #f5f5f5);
          color: var(--fintech-primary, #667eea);
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    // Dark theme
    :host-context(.dark-theme) {
      button {
        &.stroked {
          border-color: #667eea;
          color: #667eea;

          &:hover {
            background: rgba(102, 126, 234, 0.2);
          }
        }

        &.icon-only {
          color: rgba(255, 255, 255, 0.7);

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #667eea;
          }
        }
      }
    }
  `]
})
export class BackupExportButtonComponent {
  variant = input<'stroked' | 'raised' | 'icon-only'>('icon-only');
  showLabel = input(true);
  label = input('Sauvegarder');
  icon = input('download');
  tooltipText = input('Exporter une sauvegarde de vos données');

  isExporting = signal(false);
  private backupService = inject(BackupService);

  async exportData(): Promise<void> {
    if (this.isExporting()) return;

    this.isExporting.set(true);
    try {
      await this.backupService.exportToZip();
    } finally {
      this.isExporting.set(false);
    }
  }
}
