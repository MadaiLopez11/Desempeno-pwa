import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ItunesSearchResponse, Track } from '../models/music.model';

@Injectable({
  providedIn: 'root'
})
export class MusicApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://itunes.apple.com/search';

  searchTracks(query: string, limit = 20): Observable<Track[]> {
    const cleanQuery = query.trim() || 'latin mafia';

    const params = new HttpParams()
      .set('term', cleanQuery)
      .set('media', 'music')
      .set('entity', 'song')
      .set('limit', limit.toString());

    return this.http.get<ItunesSearchResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.results.filter((item) => !!item.trackId && !!item.trackName)),
      catchError((error: HttpErrorResponse) => {
        let userMessage = 'No se pudieron cargar las canciones.';

        if (error.status === 0) {
          userMessage = 'Sin conexión a internet o no hay datos cacheados para esta búsqueda.';
        } else if (error.status >= 500) {
          userMessage = 'El servicio externo de música presentó un error del servidor.';
        } else if (error.status === 404) {
          userMessage = 'No se encontró el recurso solicitado en la API.';
        }

        return throwError(() => new Error(userMessage));
      })
    );
  }
}