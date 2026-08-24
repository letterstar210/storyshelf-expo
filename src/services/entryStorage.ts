import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ENTRIES } from '../constants/defaultEntries.generated';
import { Entry, LinkCheck } from '../types/entry';

const STORAGE_KEY = 'reading_entries_v2';
const LEGACY_STORAGE_KEYS = ['reading_entries'];
const SEEDED_ENTRIES = DEFAULT_ENTRIES;

const normalizeDate = (value: unknown) => {
  return typeof value === 'string' && value.trim() ? value : new Date().toISOString();
};

const normalizeSeriesStatus = (value: unknown): NonNullable<Entry['seriesStatus']> => {
  return value === 'completed' || value === 'discontinued' ? value : 'ongoing';
};

const normalizeLinkCheck = (value: unknown): LinkCheck | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as Partial<LinkCheck>;
  const status = candidate.status;

  if (
    status !== 'unchecked' &&
    status !== 'up-to-date' &&
    status !== 'update-available' &&
    status !== 'broken' &&
    status !== 'check-failed'
  ) {
    return undefined;
  }

  return {
    status,
    checkedAt: normalizeDate(candidate.checkedAt),
    latestEpisode:
      typeof candidate.latestEpisode === 'string' ? candidate.latestEpisode.trim() || undefined : undefined,
    updateCount:
      typeof candidate.updateCount === 'number' && Number.isFinite(candidate.updateCount)
        ? candidate.updateCount
        : undefined,
    sourceHost:
      typeof candidate.sourceHost === 'string' ? candidate.sourceHost.trim() || undefined : undefined,
    message: typeof candidate.message === 'string' ? candidate.message.trim() || undefined : undefined,
  };
};

const normalizeEntry = (value: Partial<Entry>, index: number): Entry => {
  const fallbackDate = new Date(Date.now() - index * 1000).toISOString();

  return {
    id: typeof value.id === 'string' && value.id.trim() ? value.id : `${Date.now()}-${index}`,
    title: typeof value.title === 'string' ? value.title.trim() : '',
    episode: typeof value.episode === 'string' ? value.episode.trim() : '',
    link: typeof value.link === 'string' ? value.link.trim() : '',
    linkCheck: normalizeLinkCheck(value.linkCheck),
    seriesStatus: normalizeSeriesStatus(value.seriesStatus),
    coverImage: typeof value.coverImage === 'string' ? value.coverImage.trim() : '',
    localImageUri:
      typeof value.localImageUri === 'string' && value.localImageUri.trim()
        ? value.localImageUri
        : undefined,
    createdAt: normalizeDate(value.createdAt ?? fallbackDate),
    updatedAt: normalizeDate(value.updatedAt ?? value.createdAt ?? fallbackDate),
  };
};

export const loadEntries = async (): Promise<Entry[]> => {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    if (LEGACY_STORAGE_KEYS.length > 0) {
      await AsyncStorage.multiRemove(LEGACY_STORAGE_KEYS);
    }
    return SEEDED_ENTRIES;
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return SEEDED_ENTRIES;
    }

    return parsedValue
      .map((entry, index) => normalizeEntry(entry, index))
      .filter((entry) => entry.title.length > 0)
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
  } catch (error) {
    return SEEDED_ENTRIES;
  }
};

export const saveEntries = async (entries: Entry[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const clearStoredEntries = async () => {
  await AsyncStorage.multiRemove([STORAGE_KEY, ...LEGACY_STORAGE_KEYS]);
};
