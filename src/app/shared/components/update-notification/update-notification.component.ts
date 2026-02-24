import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UpdateService } from '../../../core/services/update.service';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule],
  template: `
    @if (updateAvailable) {
      <div class="update-bar" role="alert">
        <div class="update-content">
          <span class="update-icon">🎉</span>
          <div class="update-text">
            <strong>Nouvelle version disponible !</strong>
            <span>Des améliorations vous attendent.</span>
          </div>
        </div>
        <div class="update-actions">
          <button mat-button (click)="dismiss()">Plus tard</button>
          <button mat-raised-button color="primary" (click)="update()">
            Mettre à jour maintenant
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .update-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
      
      @media (max-width: 600px) {
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        text-align: center;
      }
    }
    
    .update-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .update-icon {
      font-size: 32px;
    }
    
    .update-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      strong {
        font-size: 15px;
        font-weight: 500;
      }
      
      span {
        font-size: 14px;
        opacity: 0.9;
      }
    }
    
    .update-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      
      button[mat-button] {
        color: white;
      }
    }
  `]
})
export class UpdateNotificationComponent {
  private updateService = inject(UpdateService);
  private snackBar = inject(MatSnackBar);
  
  updateAvailable = false;
  
  constructor() {
    this.updateService.updateAvailable.subscribe(available => {
      this.updateAvailable = available;
    });
  }
  
  update(): void {
    this.updateService.forceUpdate();
  }
  
  dismiss(): void {
    this.updateAvailable = false;
    this.snackBar.open('La mise à jour sera appliquée lors de votre prochaine visite', 'OK', {
      duration: 5000
    });
  }
}
