import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { LocalStorageService } from './services/local-storage.service';

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
    MatListModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private storageService = inject(LocalStorageService);
  
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  isDarkMode = false;
  
  ngOnInit(): void {
    this.isDarkMode = this.storageService.loadThemePreference();
    this.applyTheme();
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
