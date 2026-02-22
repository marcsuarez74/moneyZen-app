import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface VersionInfo {
  version: string;
  date: string;
  name: string;
  description: string;
  repository: string;
  author: string;
  license: string;
}

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private http = inject(HttpClient);

  readonly versionInfo = signal<VersionInfo | null>(null);
  readonly isLoaded = signal(false);

  async loadVersionInfo(): Promise<void> {
    if (this.isLoaded()) return;

    try {
      const info = await this.http.get<VersionInfo>('assets/version.json').toPromise();
      if (info) {
        this.versionInfo.set(info);
        this.isLoaded.set(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations de version:', error);
      // Version par défaut en cas d'erreur
      this.versionInfo.set({
        version: '1.0.0',
        date: new Date().toISOString().split('T')[0],
        name: 'MoneyZen',
        description: 'Application de gestion budgétaire',
        repository: 'https://github.com/marcsuarez/budget-app',
        author: 'Marc Suarez',
        license: 'MIT'
      });
      this.isLoaded.set(true);
    }
  }

  getShortVersion(): string {
    const info = this.versionInfo();
    return info?.version ?? '1.0.0';
  }

  getFullVersion(): string {
    const info = this.versionInfo();
    if (!info) return 'v1.0.0';
    return `v${info.version} (${info.date})`;
  }
}
