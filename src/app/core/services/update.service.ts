import { inject, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private swUpdate = inject(SwUpdate);
  private updateAvailable$ = new BehaviorSubject<boolean>(false);
  updateAvailable = this.updateAvailable$.asObservable();

  init(): void {
    if (this.swUpdate.isEnabled) {
      // Vérifier les mises à jour disponibles
      this.swUpdate.versionUpdates
        .pipe(
          filter(event => event.type === 'VERSION_READY'),
          map(event => event.type)
        )
        .subscribe(() => {
          console.log('✅ Nouvelle version disponible !');
          this.updateAvailable$.next(true);
        });

      // Écouter les updates automatiquement
      this.swUpdate.versionUpdates
        .pipe(
          filter(event => event.type === 'VERSION_DETECTED')
        )
        .subscribe(() => {
          console.log('🔄 Téléchargement de la nouvelle version...');
        });
    }
  }

  forceUpdate(): void {
    if (this.swUpdate.isEnabled) {
      // Recharger la page pour activer la nouvelle version
      document.location.reload();
    }
  }
}
