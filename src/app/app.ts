import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicApiService } from './services/music-api';
import { PushNotificationService } from './services/push-notification';
import { Track } from './models/music.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly musicApi = inject(MusicApiService);
  readonly pushService = inject(PushNotificationService);

  searchQuery = 'latin mafia';
  readonly tracks = signal<Track[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  ngOnInit(): void {
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
    this.searchMusic();
  }

  searchMusic(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.musicApi.searchTracks(this.searchQuery, 18).subscribe({
      next: (results) => {
        this.tracks.set(results);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      }
    });
  }

  notifySelectedArtist(artist: string): void {
    this.pushService.sendTestAlert(artist);
  }
  getHighResArtwork(url: string): string {
    if (!url) {
      return '/icons/icon-192x192.png';
    }
    return url.replace('100x100bb', '600x600bb').replace('100x100', '600x600');
  }
}