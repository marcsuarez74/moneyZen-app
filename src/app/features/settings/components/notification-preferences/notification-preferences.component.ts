import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PushNotificationService } from '../../../../core/services/push-notification.service';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-notification-preferences',
  templateUrl: './notification-preferences.component.html',
  styleUrls: ['./notification-preferences.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class NotificationPreferencesComponent {
  private readonly pushService = inject(PushNotificationService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);
  protected readonly testing = signal(false);

  readonly preferences = this.pushService.preferences;
  readonly isSubscribed = this.pushService.isSubscribed;
  readonly isEnabled = this.pushService.isEnabled;
  readonly hasPermission = this.pushService.hasPermission;
  readonly isPermissionDenied = this.pushService.isPermissionDenied;
  readonly notificationSupported = this.pushService.notificationSupported;
  readonly error = this.pushService.error;

  readonly canEnableNotifications = computed(
    () => this.notificationSupported && !this.isPermissionDenied()
  );


  async toggleNotifications(): Promise<void> {
    const currentEnabled = this.preferences()?.enabled ?? false;

    if (!currentEnabled) {
      await this.enableNotifications();
    } else {
      await this.disableNotifications();
    }
  }

  async enableNotifications(): Promise<void> {
    if (!this.notificationSupported) {
      this.snackBar.open('Les notifications ne sont pas supportées par votre navigateur', 'OK', {
        duration: 4000,
      });
      return;
    }

    this.loading.set(true);

    try {
      const granted = await this.pushService.requestPermission();

      if (granted) {
        this.snackBar.open('Notifications activées avec succès!', 'OK', { duration: 3000 });
      } else {
        this.snackBar.open(
          "Permission refusée. Vous pouvez l'activer dans les paramètres de votre navigateur.",
          'OK',
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      this.snackBar.open("Erreur lors de l'activation des notifications", 'OK', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }

  async disableNotifications(): Promise<void> {
    this.loading.set(true);

    try {
      await this.pushService.unsubscribeFromPush();
      this.snackBar.open('Notifications désactivées', 'OK', { duration: 3000 });
    } catch (err) {
      console.error('Error disabling notifications:', err);
      this.snackBar.open('Erreur lors de la désactivation', 'OK', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  onBudgetAlertsChange(enabled: boolean): void {
    this.pushService.updatePreference('budgetAlerts', enabled);
  }

  onBudgetThresholdChange(value: number): void {
    this.pushService.updatePreference('budgetAlertThreshold', value);
  }

  onWeeklySummariesChange(enabled: boolean): void {
    this.pushService.updatePreference('weeklySummaries', enabled);
  }

  onDailyRemindersChange(enabled: boolean): void {
    this.pushService.updatePreference('dailyReminders', enabled);
  }

  onReminderTimeChange(time: string): void {
    this.pushService.updatePreference('reminderTime', time);
  }

  async testNotification(): Promise<void> {
    this.testing.set(true);

    try {
      await this.pushService.testNotification();
      this.snackBar.open('Notification de test envoyée!', 'OK', { duration: 3000 });
    } catch (err) {
      console.error('Error sending test notification:', err);
      this.snackBar.open("Erreur lors de l'envoi de la notification de test", 'OK', {
        duration: 4000,
      });
    } finally {
      this.testing.set(false);
    }
  }

  getNotificationStatusIcon(): string {
    if (this.isEnabled()) {
      return 'notifications_active';
    } else if (this.isPermissionDenied()) {
      return 'notifications_off';
    } else {
      return 'notifications_none';
    }
  }

  getNotificationStatusText(): string {
    if (this.isEnabled()) {
      return 'Notifications activées';
    } else if (this.isPermissionDenied()) {
      return 'Notifications bloquées par le navigateur';
    } else {
      return 'Notifications désactivées';
    }
  }
}
