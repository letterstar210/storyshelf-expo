export type SeriesStatus = 'ongoing' | 'completed' | 'discontinued';

export interface Entry {
  id: string;
  title: string;
  episode: string;
  link: string;
  seriesStatus?: SeriesStatus;
  coverImage: string;
  localImageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryDraft {
  title: string;
  episode: string;
  link: string;
  seriesStatus?: SeriesStatus;
  coverImage: string;
  localImageUri?: string;
}
