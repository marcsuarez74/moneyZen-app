import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VersionService } from '../../../core/services/version.service';

@Component({
  selector: 'app-version-display',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="version-display" [matTooltip]="getTooltip()">
      <mat-icon>info</mat-icon>
      <span class="version-text">v{{ versionService.getShortVersion() }}</span>
    </div>
  `,
  styles: [`
    .version-display {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--text-secondary);
      padding: 4px 8px;
      border-radius: 4px;
      cursor: help;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--surface-variant);
      }

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .version-text {
        font-family: monospace;
      }
    }
  `]
})
export class VersionDisplayComponent implements OnInit {
  protected versionService = inject(VersionService);

  async ngOnInit(): Promise<void> {
    await this.versionService.loadVersionInfo();
  }

  getTooltip(): string {
    const info = this.versionService.versionInfo();
    if (!info) return 'Chargement...';

    return `${info.name} v${info.version}\n${info.description}\nDate: ${info.date}`;
  }
}
