import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { InstallPromptService } from '../../../core/services/install-prompt.service';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    @if (showButton()) {
      <button 
        mat-raised-button 
        color="accent" 
        class="install-button"
        (click)="installApp()"
        aria-label="Installer l'application">
        <mat-icon>install_mobile</mat-icon>
        <span>Installer l'app</span>
      </button>
    } @else if (showManualInstructions()) {
      <button 
        mat-button
        color="accent" 
        class="install-manual-button"
        (click)="showInstallInstructions()"
        aria-label="Comment installer l'application">
        <mat-icon>help_outline</mat-icon>
        <span>Installer ?</span>
      </button>
    }
  `,
  styles: [`
    .install-button, .install-manual-button {
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
    
    .install-manual-button {
      opacity: 0.8;
    }
  `]
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  private installService = inject(InstallPromptService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();
  
  showButton = signal(false);
  showManualInstructions = signal(false);
  
  ngOnInit(): void {
    // Vérification initiale
    this.checkInstallAvailability();
    
    // S'abonner aux changements de disponibilité du prompt
    this.installService.installPromptAvailable$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAvailable => {
        if (isAvailable) {
          console.log('✅ Prompt d\'installation maintenant disponible !');
          this.showButton.set(true);
          this.showManualInstructions.set(false);
        }
      });
    
    // Si pas de prompt après 5 secondes, montrer les instructions manuelles
    setTimeout(() => {
      if (!this.showButton()) {
        const isInstallable = this.installService.isInstallable();
        const isStandalone = this.installService.isStandalone();
        
        if (!isStandalone && !isInstallable) {
          // Safari/Firefox - pas de support natif
          this.showManualInstructions.set(true);
        }
      }
    }, 5000);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  checkInstallAvailability(): void {
    const isStandalone = this.installService.isStandalone();
    const isInstallable = this.installService.isInstallable();
    const isPromptReady = this.installService.isPromptReady();
    
    if (isStandalone) {
      // App déjà installée - ne rien montrer
      this.showButton.set(false);
      this.showManualInstructions.set(false);
    } else if (isInstallable && isPromptReady) {
      // Prompt disponible - montrer le bouton
      this.showButton.set(true);
      this.showManualInstructions.set(false);
    } else if (!isInstallable) {
      // Safari/Firefox - pas de support natif
      this.showButton.set(false);
      // Attendre 5 secondes avant de montrer les instructions
    } else {
      // Chrome/Edge mais pas encore de prompt - attendre
      console.log('⏳ En attente du prompt d\'installation...');
      console.log('💡 Sur Chrome/Edge : regardez l\'icône dans la barre d\'adresse');
    }
  }
  
  async installApp(): Promise<void> {
    if (!this.installService.isPromptReady()) {
      this.showInstallInstructions();
      return;
    }
    
    try {
      const accepted = await this.installService.showInstallPrompt();
      if (accepted) {
        this.showButton.set(false);
        this.snackBar.open('🎉 Application installée avec succès !', 'OK', { duration: 3000 });
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
      this.showInstallInstructions();
    }
  }
  
  showInstallInstructions(): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      this.snackBar.open(
        '📱 iPhone/iPad : Appuyez sur le bouton Partager ↗️ puis "Sur l\'écran d\'accueil"',
        'OK',
        { duration: 8000 }
      );
    } else if (isAndroid) {
      this.snackBar.open(
        '📱 Android : Ouvrez Chrome puis Menu (⋮) > Installer l\'application',
        'OK',
        { duration: 8000 }
      );
    } else {
      this.snackBar.open(
        '💻 Desktop : Chrome/Edge affichent une icône d\'installation dans la barre d\'adresse',
        'OK',
        { duration: 8000 }
      );
    }
  }
}
