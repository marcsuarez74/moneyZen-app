import { Injectable, inject, isDevMode, Signal, signal, computed, DestroyRef } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Messaging, getToken, onMessage, deleteToken } from '@angular/fire/messaging';
import { environment } from '../../../environments/environment';

export interface PushNotificationPreferences {
  enabled: boolean;
  budgetAlerts: boolean;
  budgetAlertThreshold: number;
  weeklySummaries: boolean;
  dailyReminders: boolean;
  reminderTime: string;
}

export interface NotificationPayload {
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: { action: string; title: string }[];
    data?: Record<string, unknown>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private readonly swPush = inject(SwPush);
  private readonly messaging = inject(Messaging);
  private readonly destroyRef = inject(DestroyRef);

  private readonly defaultPreferences: PushNotificationPreferences = {
    enabled: false,
    budgetAlerts: true,
    budgetAlertThreshold: 80,
    weeklySummaries: true,
    dailyReminders: false,
    reminderTime: '20:00',
  };

  private readonly _preferences = signal<PushNotificationPreferences>(this.loadPreferences());
  private readonly _isSubscribed = signal<boolean>(false);
  private readonly _fcmToken = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);

  readonly preferences: Signal<PushNotificationPreferences> = this._preferences.asReadonly();
  readonly isSubscribed: Signal<boolean> = this._isSubscribed.asReadonly();
  readonly fcmToken: Signal<string | null> = this._fcmToken.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  readonly isEnabled = computed(() => this._preferences().enabled && this._isSubscribed());
  readonly hasPermission = computed(() => Notification.permission === 'granted');
  readonly isPermissionDenied = computed(() => Notification.permission === 'denied');

  readonly notificationSupported = 'Notification' in window && 'serviceWorker' in navigator;

  constructor() {
    this.initializeFCM();
    this.checkExistingSubscription();
    this.listenToMessages();
  }

  private async initializeFCM(): Promise<void> {
    if (!this.notificationSupported) {
      console.log('Notifications not supported in this browser');
      return;
    }

    // Listen for foreground messages from FCM
    onMessage(this.messaging, payload => {
      if (isDevMode()) {
        console.log('FCM foreground message received:', payload);
      }
      this.handleFCMMessage(payload);
    });
  }

  private handleFCMMessage(payload: any): void {
    const notification = payload.notification;
    if (notification) {
      // Show notification using service worker for consistent behavior
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          const options: NotificationOptions & {
            badge?: string;
            actions?: { action: string; title: string }[];
          } = {
            body: notification.body,
            icon: notification.icon || '/assets/icons/icon-192x192.png',
            badge: notification.badge || '/assets/icons/icon-72x72.png',
            tag: payload.data?.tag || 'fcm-message',
            requireInteraction: payload.data?.requireInteraction === 'true',
            data: payload.data,
            actions: payload.data?.actions ? JSON.parse(payload.data.actions) : undefined,
          };
          registration.showNotification(notification.title, options);
        });
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.notificationSupported) {
      this._isSubscribed.set(false);
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';

    if (granted) {
      await this.subscribeToFCM();
    } else {
      this._isSubscribed.set(false);
    }

    return granted;
  }

  async subscribeToFCM(): Promise<boolean> {
    if (!this.notificationSupported) {
      this._error.set('Notifications are not supported');
      this._isSubscribed.set(false);
      return false;
    }

    const vapidKey = environment.firebase.vapidKey;

    if (!vapidKey || vapidKey === 'YOUR_VAPID_PUBLIC_KEY') {
      this._error.set('VAPID key not configured. Please configure Firebase Cloud Messaging first.');
      if (isDevMode()) {
        console.warn('FCM not configured. Add your Firebase VAPID key to environment.ts');
      }
      return false;
    }

    try {
      // Get FCM token using AngularFire
      const token = await getToken(this.messaging, { vapidKey });

      if (token) {
        this._isSubscribed.set(true);
        this._fcmToken.set(token);
        this.updatePreference('enabled', true);

        // Also subscribe to SwPush for additional reliability
        await this.subscribeToSwPush();

        await this.sendSubscriptionToServer(token);

        if (isDevMode()) {
          console.log('FCM subscription successful:', token);
        }

        return true;
      } else {
        this._error.set('No FCM token received');
        this._isSubscribed.set(false);
        return false;
      }
    } catch (err) {
      console.error('Could not subscribe to FCM:', err);
      this._error.set('Failed to subscribe to push notifications');
      this._isSubscribed.set(false);
      return false;
    }
  }

  private async subscribeToSwPush(): Promise<void> {
    if (this.swPush.isEnabled && environment.firebase.vapidKey) {
      try {
        await this.swPush.requestSubscription({
          serverPublicKey: environment.firebase.vapidKey,
        });
      } catch (err) {
        console.log('SwPush subscription skipped (FCM already handling):', err);
      }
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      // Delete FCM token
      await deleteToken(this.messaging);

      // Unsubscribe from SwPush as well
      if (this.swPush.isEnabled) {
        await this.swPush.unsubscribe();
      }

      this._isSubscribed.set(false);
      this._fcmToken.set(null);
      this.updatePreference('enabled', false);

      await this.removeSubscriptionFromServer();

      if (isDevMode()) {
        console.log('Unsubscribed from FCM');
      }

      return true;
    } catch (err) {
      console.error('Could not unsubscribe:', err);
      this._error.set('Failed to unsubscribe');
      return false;
    }
  }

  private checkExistingSubscription(): void {
    // Check SwPush status
    if (this.swPush.isEnabled) {
      this.swPush.subscription.subscribe(sub => {
        if (sub && !this._isSubscribed()) {
          // If SwPush is subscribed but FCM isn't, update status
          this._isSubscribed.set(true);
        }
      });
    }
  }

  updatePreference<K extends keyof PushNotificationPreferences>(
    key: K,
    value: PushNotificationPreferences[K]
  ): void {
    const current = this._preferences();
    this._preferences.set({ ...current, [key]: value });
    this.savePreferences();
  }

  updateAllPreferences(newPreferences: Partial<PushNotificationPreferences>): void {
    const current = this._preferences();
    this._preferences.set({ ...current, ...newPreferences });
    this.savePreferences();
  }

  async testNotification(): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error('Push notifications are not enabled');
    }

    await this.sendPushNotificationViaCloud(
      'Test MoneyZen',
      'Vos notifications push fonctionnent correctement! 🎉',
      'test',
      { url: '/' }
    );
  }

  async sendBudgetAlert(budgetName: string, percentage: number, remaining: number): Promise<void> {
    if (!this.isEnabled() || !this._preferences().budgetAlerts) {
      return;
    }

    const threshold = this._preferences().budgetAlertThreshold;
    if (percentage < threshold) {
      return;
    }

    await this.sendPushNotificationViaCloud(
      '⚠️ Alerte Budget',
      `Votre budget "${budgetName}" a atteint ${percentage.toFixed(0)}%. Reste: ${remaining}€`,
      'budget-alert',
      { budgetName, percentage: percentage.toString(), remaining: remaining.toString() }
    );
  }

  async sendWeeklySummary(
    totalSpent: number,
    totalBudget: number,
    topCategories: { name: string; amount: number }[]
  ): Promise<void> {
    if (!this.isEnabled() || !this._preferences().weeklySummaries) {
      return;
    }

    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remaining = totalBudget - totalSpent;

    const topCategoryText =
      topCategories.length > 0
        ? `Dominé par: ${topCategories[0].name} (${topCategories[0].amount}€)`
        : '';

    await this.sendPushNotificationViaCloud(
      '📊 Résumé Hebdomadaire',
      `Semaine: ${totalSpent}€/${totalBudget}€ (${percentage.toFixed(0)}%). Reste: ${remaining}€. ${topCategoryText}`,
      'weekly-summary',
      { totalSpent: totalSpent.toString(), totalBudget: totalBudget.toString() }
    );
  }

  /**
   * Send push notification via Firebase Cloud Function
   * This works even when the app is closed/background
   */
  private async sendPushNotificationViaCloud(
    title: string,
    body: string,
    type: 'budget-alert' | 'weekly-summary' | 'daily-reminder' | 'test',
    data?: Record<string, string>
  ): Promise<void> {
    const token = this._fcmToken();
    if (!token) {
      if (isDevMode()) {
        console.log('No FCM token available, falling back to local notification');
      }
      // Fallback to local notification
      this.sendLocalNotification({
        notification: {
          title,
          body,
          icon: '/assets/icons/icon-192x192.png',
          badge: '/assets/icons/icon-72x72.png',
        },
      });
      return;
    }

    try {
      const projectId = environment.firebase.projectId;
      const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/sendPushNotification`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          title,
          body,
          type,
          data: {
            timestamp: new Date().toISOString(),
            ...data,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();

      if (isDevMode()) {
        console.log('Notification sent via cloud:', result);
      }
    } catch (error) {
      console.error('Error sending notification via cloud:', error);
      // Fallback to local notification
      this.sendLocalNotification({
        notification: {
          title,
          body,
          icon: '/assets/icons/icon-192x192.png',
          badge: '/assets/icons/icon-72x72.png',
        },
      });
    }
  }

  private listenToMessages(): void {
    // Handle SwPush messages (backup)
    this.swPush.messages.subscribe((message: unknown) => {
      if (isDevMode()) {
        console.log('SwPush message received:', message);
      }
    });

    this.swPush.notificationClicks.subscribe(event => {
      if (isDevMode()) {
        console.log('Notification clicked:', event);
      }

      const notification = event.notification;
      const data = notification.data as Record<string, unknown> | undefined;

      if (data?.['type'] === 'budget-alert') {
        window.open('/budget', '_self');
      } else if (data?.['type'] === 'weekly-summary') {
        window.open('/budget', '_self');
      } else {
        window.open('/', '_self');
      }
    });
  }

  private async sendSubscriptionToServer(token: string): Promise<void> {
    const preferences = this._preferences();

    const payload = {
      fcmToken: token,
      preferences: preferences,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Store locally
    localStorage.setItem('push-subscription', JSON.stringify(payload));

    // In production, POST to your backend here:
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    localStorage.removeItem('push-subscription');
    // await fetch('/api/push/unsubscribe', { method: 'POST' });
  }

  private loadPreferences(): PushNotificationPreferences {
    try {
      const saved = localStorage.getItem('notification-preferences');
      if (saved) {
        return { ...this.defaultPreferences, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load notification preferences:', e);
    }
    return this.defaultPreferences;
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('notification-preferences', JSON.stringify(this._preferences()));
    } catch (e) {
      console.error('Failed to save notification preferences:', e);
    }
  }

  private sendLocalNotification(payload: NotificationPayload): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        const options: NotificationOptions & {
          actions?: { action: string; title: string }[];
        } = {
          body: payload.notification.body,
          icon: payload.notification.icon,
          badge: payload.notification.badge,
          tag: payload.notification.tag,
          requireInteraction: payload.notification.requireInteraction,
          actions: payload.notification.actions,
          data: payload.notification.data,
        };
        registration.showNotification(payload.notification.title, options);
      });
    } else {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon,
        badge: payload.notification.badge,
        tag: payload.notification.tag,
        requireInteraction: payload.notification.requireInteraction,
      });
    }
  }
}
