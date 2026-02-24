import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({
  providedIn: 'root'
})
export class InstallPromptService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installPromptAvailable = new BehaviorSubject<boolean>(false);
  installPromptAvailable$ = this.installPromptAvailable.asObservable();

  constructor() {
    // Écouter l'événement beforeinstallprompt (Chrome/Android)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Empêcher l'affichage automatique du prompt
      e.preventDefault();
      // Stocker l'événement pour l'utiliser plus tard
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      // Indiquer qu'il est disponible
      this.installPromptAvailable.next(true);
      console.log('✅ Installation prompt ready');
    });

    // Détecter quand l'app est installée
    window.addEventListener('appinstalled', () => {
      console.log('🎉 Application installée avec succès !');
      this.installPromptAvailable.next(false);
      this.deferredPrompt = null;
    });
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('❌ Prompt d\'installation non disponible');
      return false;
    }

    // Afficher le prompt
    this.deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await this.deferredPrompt.userChoice;
    
    // Réinitialiser
    this.deferredPrompt = null;
    this.installPromptAvailable.next(false);

    return outcome === 'accepted';
  }

  isStandalone(): boolean {
    // Vérifier si l'app est déjà installée (standalone mode)
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window as any).navigator?.standalone === true
    );
  }

  isInstallable(): boolean {
    // Vérifier si l'installation est supportée
    return 'BeforeInstallPromptEvent' in window;
  }

  isPromptReady(): boolean {
    return this.deferredPrompt !== null;
  }
}
