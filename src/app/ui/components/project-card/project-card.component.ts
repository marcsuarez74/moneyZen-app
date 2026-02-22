import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatButtonModule, CurrencyPipe],
  template: `
    <mat-card class="project-card">
      <mat-card-content>
        <div class="project-header">
          <div class="project-icon" [class]="'priority-' + project().priority">
            <mat-icon>{{ getCategoryIcon(project().category) }}</mat-icon>
          </div>
          <div class="project-info">
            <h3 class="project-name">{{ project().name }}</h3>
            <span class="project-category">{{ getCategoryLabel(project().category) }}</span>
          </div>
        </div>
        
        <p class="project-description">{{ project().description }}</p>
        
        <div class="project-progress">
          <div class="progress-header">
            <span class="progress-text">
              {{ project().currentAmount | currency:'EUR':'symbol':'1.0-0' }} / 
              {{ project().targetAmount | currency:'EUR':'symbol':'1.0-0' }}
            </span>
            <span class="progress-percent">{{ getProgressPercent() }}%</span>
          </div>
          <mat-progress-bar 
            mode="determinate" 
            [value]="getProgressPercent()"
            [color]="getProgressColor()">
          </mat-progress-bar>
        </div>
        
        <div class="project-stats">
          <div class="stat">
            <mat-icon>calendar_today</mat-icon>
            <span>{{ getTimeRemaining() }}</span>
          </div>
          <div class="stat">
            <mat-icon>payments</mat-icon>
            <span>{{ project().monthlyContribution | currency:'EUR' }}/mois</span>
          </div>
        </div>
        
        <div class="project-actions" *ngIf="showActions()">
          <button mat-stroked-button color="primary" (click)="edit.emit(project())">
            <mat-icon>edit</mat-icon>
            Modifier
          </button>
          <button mat-stroked-button color="warn" (click)="delete.emit(project().id)">
            <mat-icon>delete</mat-icon>
            Supprimer
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .project-card {
      height: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .project-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .project-header {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .project-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-variant);
    }
    
    .project-icon.priority-high {
      background: #ffebee;
      color: #c62828;
    }
    
    .project-icon.priority-medium {
      background: #fff3e0;
      color: #e65100;
    }
    
    .project-icon.priority-low {
      background: #e8f5e9;
      color: #2e7d32;
    }
    
    .project-info {
      flex: 1;
    }
    
    .project-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .project-category {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .project-description {
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 16px;
    }
    
    .project-progress {
      margin-bottom: 16px;
    }
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    
    .progress-text {
      color: var(--text-secondary);
    }
    
    .progress-percent {
      font-weight: 500;
    }
    
    .project-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .stat mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .project-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
  readonly showActions = input<boolean>(true);
  readonly edit = output<Project>();
  readonly delete = output<string>();
  
  getProgressPercent(): number {
    const project = this.project();
    return Math.round((project.currentAmount / project.targetAmount) * 100);
  }
  
  getProgressColor(): string {
    const percent = this.getProgressPercent();
    if (percent >= 75) return 'primary';
    if (percent >= 50) return 'accent';
    return 'warn';
  }
  
  getTimeRemaining(): string {
    const project = this.project();
    if (!project.deadline) return 'Sans échéance';
    
    const remaining = project.targetAmount - project.currentAmount;
    const months = Math.ceil(remaining / project.monthlyContribution);
    
    if (months <= 0) return 'Objectif atteint!';
    if (months === 1) return '1 mois restant';
    return `${months} mois restants`;
  }
  
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'emergency-fund': 'Emergency',
      travel: 'flight',
      home: 'home_work',
      vehicle: 'directions_car',
      education: 'school',
      retirement: 'elderly',
      investment: 'trending_up',
      other: 'category'
    };
    return icons[category] || 'category';
  }
  
  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'emergency-fund': 'Fond d\'urgence',
      travel: 'Voyage',
      home: 'Immobilier',
      vehicle: 'Véhicule',
      education: 'Éducation',
      retirement: 'Retraite',
      investment: 'Investissement',
      other: 'Autre'
    };
    return labels[category] || category;
  }
}
