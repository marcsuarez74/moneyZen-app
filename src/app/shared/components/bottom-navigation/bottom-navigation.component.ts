/**
 * Bottom Navigation bar pour mobile
 * Remplace le drawer sur mobile avec un design fintech et animations
 */
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: number;
}

@Component({
  selector: 'app-bottom-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatRippleModule, MatIconModule],
  template: `
    <nav class="bottom-nav" [class.visible]="isVisible()">
      <div class="nav-items">
        @for (item of navItems; track item.path) {
          <a 
            class="nav-item"
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            matRipple
            [matRippleCentered]="true"
            [matRippleRadius]="28">
            <div class="item-icon-wrapper">
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              @if (item.badge) {
                <span class="badge">{{ item.badge }}</span>
              }
            </div>
            <span class="nav-label">{{ item.label }}</span>
            <div class="active-indicator"></div>
          </a>
        }
      </div>
      
      <!-- Safe area pour iPhone X+ -->
      <div class="safe-area"></div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--fintech-surface, #ffffff);
      border-top: 1px solid var(--fintech-border, rgba(0, 0, 0, 0.08));
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
      z-index: 1000;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &.visible {
        transform: translateY(0);
      }

      @media (min-width: 768px) {
        display: none;
      }
    }

    .nav-items {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 64px;
      padding: 0 16px;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      height: 56px;
      text-decoration: none;
      color: var(--fintech-text-tertiary, #9e9e9e);
      position: relative;
      transition: color 0.2s ease;
      border-radius: 12px;
      overflow: hidden;

      &:hover {
        color: var(--fintech-text-secondary, #666666);
      }

      &.active {
        color: var(--fintech-primary, #667eea);

        .active-indicator {
          transform: scaleX(1);
          opacity: 1;
        }

        .item-icon-wrapper {
          transform: translateY(-2px);
        }

        .nav-icon {
          animation: bounce 0.3s ease;
        }
      }
    }

    .item-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      transition: transform 0.2s ease;
    }

    .nav-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      transition: all 0.2s ease;
    }

    .nav-label {
      font-size: 11px;
      font-weight: 500;
      margin-top: 2px;
      letter-spacing: 0.3px;
    }

    .active-indicator {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      width: 24px;
      height: 3px;
      background: var(--gradient-fintech-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
      border-radius: 2px;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -8px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: var(--fintech-error, #f44336);
      color: white;
      font-size: 10px;
      font-weight: 600;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(244, 67, 54, 0.4);
      animation: pulse-badge 2s infinite;
    }

    .safe-area {
      height: env(safe-area-inset-bottom, 0);
      background: var(--fintech-surface, #ffffff);
    }

    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    @keyframes pulse-badge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    // Dark Theme
    :host-context(.dark-theme) {
      .bottom-nav {
        background: linear-gradient(180deg, #1e1e2e 0%, #252538 100%);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      }

      .nav-item {
        color: rgba(255, 255, 255, 0.5);

        &:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        &.active {
          color: #667eea;
        }
      }

      .safe-area {
        background: linear-gradient(180deg, #252538 0%, #252538 100%);
      }
    }
  `]
})
export class BottomNavigationComponent {
  isVisible = signal(true);
  
  navItems: NavItem[] = [
    { path: '/budget', icon: 'account_balance_wallet', label: 'Budget' },
    { path: '/projects', icon: 'savings', label: 'Projets' },
    { path: '/settings', icon: 'settings', label: 'Paramètres' }
  ];
}
