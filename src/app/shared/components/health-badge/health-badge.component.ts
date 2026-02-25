import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

type HealthStatus = 'healthy' | 'warning' | 'critical';

@Component({
  selector: 'app-health-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './health-badge.component.html',
  styleUrl: './health-badge.component.scss',
})
export class HealthBadgeComponent {
  readonly health = input<number>(100);

  getStatus(): HealthStatus {
    const h = this.health();
    if (h >= 70) return 'healthy';
    if (h >= 40) return 'warning';
    return 'critical';
  }

  getIcon(): string {
    switch (this.getStatus()) {
      case 'healthy':
        return 'trending_up';
      case 'warning':
        return 'trending_flat';
      case 'critical':
        return 'trending_down';
    }
  }

  getTooltip(): string {
    const h = this.health();
    const status = this.getStatus();
    const labels: Record<HealthStatus, string> = {
      healthy: 'Excellent',
      warning: 'Attention',
      critical: 'Critique',
    };
    return `Santé budget: ${labels[status]} (${h}%)`;
  }
}
