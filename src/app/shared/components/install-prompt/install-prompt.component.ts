import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { InstallPromptService } from '../../../core/services/install-prompt.service';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    @if (showInstallButton()) {
      <button 
        mat-raised-button 
        color="accent" 
        class="install-button"
        (click)="installApp()"
        aria-label="Installer l'application">
        <mat-icon>install_mobile</mat-icon>
        <span>Installer l'app</span>
      </button>
    }
  `,
  styles: [`
    .install-button {
      margin-left: 8px;
      
      mat-icon {
        margin-right: 4px;
      }
      
      @media (max-width: 600px) {
        min-width: unset;
        padding: 0 12px;
        
        span {
          display: none;
        }
        
        mat-icon {
          margin-right: 0;
        }
      }
    }
  `]
})
export class InstallPromptComponent {
  private installService = inject(InstallPromptService);
  
  showInstallButton(): boolean {
    // Ne pas afficher si déjà en mode standalone (installée)
    return !this.installService.isStandalone() && 
           this.installService.isInstallable() &&
           // Pour test : toujours vrai si le prompt est disponible
           true;
  }
  
  async installApp(): Promise<void> {
    const accepted = await this.installService.showInstallPrompt();
    if (accepted) {
      console.log('🎉 Utilisateur a accepté l\'installation');
    } else {
      console.log('❌ Utilisateur a refusé l\'installation');
    }
  }
}
