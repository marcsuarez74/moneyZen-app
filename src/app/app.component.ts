import { Component, inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { LocalStorageService } from './services/local-storage.service';
import { PlanAutoUpdateService } from './services/plan-auto-update.service';
import { VersionDisplayComponent } from './shared/components/version-display/version-display.component';
import { UpdateNotificationComponent } from './shared/components/update-notification/update-notification.component';
import { InstallPromptComponent } from './shared/components/install-prompt/install-prompt.component';
import { UpdateService } from './core/services/update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    VersionDisplayComponent,
    UpdateNotificationComponent,
    InstallPromptComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private storageService = inject(LocalStorageService);
  private planAutoUpdate = inject(PlanAutoUpdateService);
  private updateService = inject(UpdateService);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  isDarkMode = false;

  ngOnInit(): void {
    this.isDarkMode = this.storageService.loadThemePreference();
    this.applyTheme();
    this.planAutoUpdate.initialize();
    this.updateService.init();
  }

  ngOnDestroy(): void {
    this.planAutoUpdate.destroy();
  }
  
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.storageService.saveThemePreference(this.isDarkMode);
    this.applyTheme();
  }
  
  toggleSidenav(): void {
    this.sidenav.toggle();
  }
  
  closeSidenav(): void {
    this.sidenav.close();
  }
  
  resetAllData(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes vos données ?')) {
      this.storageService.clearAll();
      window.location.reload();
    }
  }
  
  private applyTheme(): void {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
