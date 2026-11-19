import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly swPush = inject(SwPush);
  private readonly http = inject(HttpClient);

  readonly isSubscribed = signal(false);
  readonly statusMessage = signal('');
  readonly incomingNotification = signal<{ title: string; body: string } | null>(null);

  constructor() {
    if (this.swPush.isEnabled) {
      this.swPush.subscription.subscribe((sub) => {
        this.isSubscribed.set(!!sub);
      });

      this.swPush.messages.subscribe((message: unknown) => {
        const msg = message as { notification?: { title?: string; body?: string } };
        if (msg?.notification) {
          this.incomingNotification.set({
            title: msg.notification.title || 'Notificación musical',
            body: msg.notification.body || ''
          });
        }
      });

      this.swPush.notificationClicks.subscribe(({ action, notification }) => {
        const targetUrl = notification?.data?.url;
        if (targetUrl && action !== 'close') {
          window.open(targetUrl, '_blank');
        }
      });
    }
  }

  async subscribeToNotifications(): Promise<void> {
    if (!this.swPush.isEnabled) {
      this.statusMessage.set('Service Worker deshabilitado (usa compilación de producción o HTTPS/localhost).');
      return;
    }

    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: environment.vapidPublicKey
      });

      await firstValueFrom(
        this.http.post(`${environment.pushServerUrl}/subscribe`, subscription)
      );

      this.isSubscribed.set(true);
      this.statusMessage.set('¡Suscrito a alertas musicales correctamente!');
    } catch (error) {
      console.error('Error al suscribirse a push:', error);
      this.statusMessage.set('No se pudo activar la suscripción (verifica permisos del navegador).');
    }
  }

  async sendTestAlert(artistName: string): Promise<void> {
    try {
      const cleanArtist = artistName.trim() || 'tu artista favorito';
      await firstValueFrom(
        this.http.post(`${environment.pushServerUrl}/notify`, {
          title: '🎧 Alerta de catálogo musical',
          body: `Se ha destacado "${cleanArtist}" en SoundPulse PWA.`,
          artist: cleanArtist,
          url: '/'
        })
      );
      this.statusMessage.set('Notificación enviada al servidor push.');
    } catch {
      this.statusMessage.set('Error al disparar notificación desde el servidor.');
    }
  }
}