/**
 * Composant de navigation interne du plan de redressement
 * Design responsive : sidebar sticky sur desktop, pills horizontales sur mobile
 */
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface PlanSection {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

@Component({
  selector: 'app-plan-navigation',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <nav class="plan-navigation" [class.sticky]="sticky()">
      <div class="nav-header">
        <mat-icon>menu</mat-icon>
        <span>Navigation</span>
      </div>
      
      <div class="nav-items">
        @for (section of sections(); track section.id) {
          @if (section.visible) {
            <button
              mat-button
              class="nav-item"
              [attr.data-section]="section.id"
              (click)="scrollToSection(section.id)"
              [matTooltip]="section.label"
              matTooltipPosition="right">
              <mat-icon>{{ section.icon }}</mat-icon>
              <span class="nav-label">{{ section.label }}</span>
            </button>
          }
        }
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    .plan-navigation {
      background: var(--fintech-surface, #ffffff);
      border-radius: 16px;
      border: 1px solid var(--fintech-border, #e0e0e0);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      width: 100%;
    }

    .nav-header {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-bottom: 1px solid var(--fintech-border, #e0e0e0);

      mat-icon {
        color: var(--fintech-primary, #667eea);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--fintech-text-primary, #212121);
      }
    }

    .nav-items {
      display: flex;
      flex-direction: row;
      gap: 8px;
      padding: 12px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--fintech-text-secondary, #666666);
      background: transparent;
      border: 1px solid var(--fintech-border, #e0e0e0);
      transition: all 0.2s ease;
      flex-shrink: 0;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--fintech-primary, #667eea);
      }

      .nav-label {
        display: inline;
      }

      &:hover {
        background: var(--fintech-surface-variant, #f5f5f5);
        border-color: var(--fintech-primary, #667eea);
        color: var(--fintech-primary, #667eea);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }

    // Hide tooltip on mobile
    ::ng-deep .mat-mdc-tooltip {
      @media (max-width: 1023px) {
        display: none !important;
      }
    }

    // ============================================
    // DESKTOP - Sidebar sticky
    // ============================================
    @media (min-width: 1024px) {
      .plan-navigation {
        width: 220px;
        position: sticky;
        top: 24px;
        max-height: calc(100vh - 48px);
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--fintech-border, #e0e0e0);
          border-radius: 2px;
        }
      }

      .nav-header {
        display: flex;
      }

      .nav-items {
        flex-direction: column;
        padding: 12px;
        gap: 4px;
        overflow-x: visible;
      }

      .nav-item {
        justify-content: flex-start;
        width: 100%;
        padding: 10px 10px;
        border-radius: 10px;
        text-align: left;
        border: none;
        border-left: 3px solid transparent;
        min-height: 44px;
        height: auto;

        &:hover {
          background: var(--fintech-surface-variant, #f5f5f5);
          border-left-color: var(--fintech-primary, #667eea);
          transform: translateX(4px);
        }

        mat-icon {
          font-size: 20px;
          width: 22px;
          height: 22px;
          min-width: 22px;
          flex-shrink: 0;
        }

        .nav-label {
          font-size: 0.875rem;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
      }
    }

    // ============================================
    // DARK THEME
    // ============================================
    :host-context(.dark-theme) {
      .plan-navigation {
        background: linear-gradient(145deg, #1e1e2e 0%, #252538 100%);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .nav-header {
        background: rgba(102, 126, 234, 0.15);
        border-color: rgba(255, 255, 255, 0.08);

        span {
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .nav-item {
        color: rgba(255, 255, 255, 0.7);
        background: rgba(255, 255, 255, 0.05);

        &:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: #667eea;
          color: #fff;
        }

        @media (min-width: 1024px) {
          background: transparent;
          border-left-color: transparent;

          &:hover {
            background: rgba(255, 255, 255, 0.08);
            border-left-color: #667eea;
          }
        }
      }
    }
  `]
})
export class PlanNavigationComponent {
  sections = input.required<PlanSection[]>();
  sticky = input<boolean>(true);

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }
}
