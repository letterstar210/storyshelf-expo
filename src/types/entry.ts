export interface Entry {
  id: string;
  title: string;
  episode: string;
  link: string;
  coverImage: string;
  localImageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryDraft {
  title: string;
  episode: string;
  link: string;
  coverImage: string;
  localImageUri?: string;
}
