export type SeriesStatus = 'ongoing' | 'completed' | 'discontinued';
export type LinkCheckStatus =
  | 'unchecked'
  | 'up-to-date'
  | 'update-available'
  | 'broken'
  | 'check-failed';

export interface LinkCheck {
  status: LinkCheckStatus;
  checkedAt: string;
  latestEpisode?: string;
  updateCount?: number;
  sourceHost?: string;
  message?: string;
}

export interface Entry {
  id: string;
  title: string;
  episode: string;
  link: string;
  linkCheck?: LinkCheck;
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
