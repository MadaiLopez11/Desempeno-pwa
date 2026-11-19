export interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl?: string;
  primaryGenreName: string;
  releaseDate: string;
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: Track[];
}