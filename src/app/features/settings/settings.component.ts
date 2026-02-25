import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NotificationPreferencesComponent } from './components/notification-preferences/notification-preferences.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NotificationPreferencesComponent],
})
export class SettingsComponent {}
