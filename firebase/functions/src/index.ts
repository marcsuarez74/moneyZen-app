import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { https } from 'firebase-functions';

admin.initializeApp();

// Interface pour la requête
interface NotificationRequest {
  token: string;
  title: string;
  body: string;
  type: 'budget-alert' | 'weekly-summary' | 'daily-reminder' | 'test';
  data?: Record<string, string>;
}

/**
 * Cloud Function pour envoyer des notifications push via FCM
 * Cette fonction est appelée par l'application Angular
 */
export const sendPushNotification = functions.https.onCall(
  async (data: NotificationRequest, context) => {
    // Log pour debugging
    console.log('Received notification request:', {
      type: data.type,
      title: data.title,
      hasToken: !!data.token,
    });

    // Validation des données
    if (!data.token) {
      throw new functions.https.HttpsError('invalid-argument', 'FCM token is required');
    }

    if (!data.title || !data.body) {
      throw new functions.https.HttpsError('invalid-argument', 'Title and body are required');
    }

    const message = {
      token: data.token,
      notification: {
        title: data.title,
        body: data.body,
      },
      data: {
        type: data.type,
        timestamp: new Date().toISOString(),
        ...data.data,
      },
      webpush: {
        notification: {
          icon: '/assets/icons/icon-192x192.png',
          badge: '/assets/icons/icon-72x72.png',
          requireInteraction: data.type === 'budget-alert',
          actions: [
            {
              action: 'open',
              title: "Ouvrir l'app",
            },
          ],
        },
        fcmOptions: {
          link: '/',
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent notification:', response);
      return {
        success: true,
        messageId: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error sending notification:', error);

      // Gestion spécifique des erreurs FCM
      if ((error as any).code === 'messaging/registration-token-not-registered') {
        throw new functions.https.HttpsError('not-found', 'Token is no longer valid');
      }

      throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
  }
);

/**
 * Cloud Function HTTP pour envoyer des notifications à tous les utilisateurs
 * À utiliser pour les broadcasts (admin uniquement)
 */
export const sendBroadcastNotification = functions.https.onRequest(
  async (req: https.Request, res: functions.Response) => {
    // Vérifier la méthode
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // TODO: Ajouter authentification admin si nécessaire
    // const authHeader = req.headers.authorization;
    // ...

    const { title, body } = req.body;
    const notificationType = req.body.type || 'broadcast';

    if (!title || !body) {
      res.status(400).json({ error: 'Title and body are required' });
      return;
    }

    // Récupérer tous les tokens (dans une vraie app, ça viendrait de Firestore)
    // Pour le moment, on retourne juste un succès
    res.json({
      success: true,
      message: 'Broadcast functionality coming soon',
      sent: 0,
    });
  }
);

/**
 * Cloud Function déclenchée par HTTP simple (pour tests/debug)
 */
export const helloWorld = functions.https.onRequest(
  (req: https.Request, res: functions.Response) => {
    res.json({
      message: 'MoneyZen Firebase Functions are running!',
      timestamp: new Date().toISOString(),
    });
  }
);
