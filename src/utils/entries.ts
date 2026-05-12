import { Entry, EntryDraft } from '../types/entry';
import { AppLanguage } from '../constants/localization';

export type EntrySortOption = 'latest' | 'oldest' | 'title-asc' | 'title-desc';

export const ENTRY_SORT_OPTIONS: EntrySortOption[] = [
  'latest',
  'oldest',
  'title-asc',
  'title-desc',
];

export const getSortLabel = (
  sortOption: EntrySortOption,
  language: AppLanguage = 'th'
) => {
  switch (sortOption) {
    case 'latest':
      return language === 'th' ? 'ล่าสุด' : 'Latest';
    case 'oldest':
      return language === 'th' ? 'เก่าสุด' : 'Oldest';
    case 'title-asc':
      return 'A-Z';
    case 'title-desc':
      return 'Z-A';
    default:
      return language === 'th' ? 'ล่าสุด' : 'Latest';
  }
};

export const getSortDescription = (
  sortOption: EntrySortOption,
  language: AppLanguage = 'th'
) => {
  switch (sortOption) {
    case 'latest':
      return language === 'th'
        ? 'เรียงตามการอัปเดตล่าสุด'
        : 'Sorted by latest update';
    case 'oldest':
      return language === 'th'
        ? 'เรียงตามการอัปเดตเก่าสุด'
        : 'Sorted by oldest update';
    case 'title-asc':
      return language === 'th'
        ? 'เรียงตามชื่อจาก A ถึง Z'
        : 'Sorted by title from A to Z';
    case 'title-desc':
      return language === 'th'
        ? 'เรียงตามชื่อจาก Z ถึง A'
        : 'Sorted by title from Z to A';
    default:
      return language === 'th'
        ? 'เรียงตามการอัปเดตล่าสุด'
        : 'Sorted by latest update';
  }
};

export const filterEntries = (entries: Entry[], searchText: string) => {
  const query = searchText.trim().toLowerCase();

  if (!query) {
    return entries;
  }

  return entries.filter((entry) => {
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.episode.toLowerCase().includes(query)
    );
  });
};

export const sortEntries = (entries: Entry[], sortOption: EntrySortOption) => {
  const nextEntries = [...entries];

  switch (sortOption) {
    case 'oldest':
      return nextEntries.sort((first, second) =>
        first.updatedAt.localeCompare(second.updatedAt)
      );
    case 'title-asc':
      return nextEntries.sort((first, second) =>
        first.title.localeCompare(second.title, 'en')
      );
    case 'title-desc':
      return nextEntries.sort((first, second) =>
        second.title.localeCompare(first.title, 'en')
      );
    case 'latest':
    default:
      return nextEntries.sort((first, second) =>
        second.updatedAt.localeCompare(first.updatedAt)
      );
  }
};

export const validateEntryDraft = (
  draft: EntryDraft,
  language: AppLanguage = 'th'
) => {
  if (!draft.title.trim()) {
    return language === 'th' ? 'กรุณากรอกชื่อเรื่อง' : 'Please enter a title.';
  }

  if (draft.link.trim()) {
    const normalized = draft.link.trim().startsWith('http')
      ? draft.link.trim()
      : `https://${draft.link.trim()}`;

    try {
      new URL(normalized);
    } catch (error) {
      return language === 'th'
        ? 'ลิงก์สำหรับอ่านไม่ถูกต้อง'
        : 'The reading link is not valid.';
    }
  }

  if (draft.coverImage.trim()) {
    try {
      new URL(draft.coverImage.trim());
    } catch (error) {
      return language === 'th'
        ? 'ลิงก์รูปปกไม่ถูกต้อง'
        : 'The cover image URL is not valid.';
    }
  }

  return null;
};

export const formatUpdatedAt = (
  isoDate: string,
  language: AppLanguage = 'th'
) => {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};
