import { useEffect, useState } from 'react';
import {
  clearStoredEntries,
  loadEntries,
  saveEntries,
} from '../services/entryStorage';
import { Entry, EntryDraft, LinkCheck } from '../types/entry';

const sortByUpdatedAt = (entries: Entry[]) =>
  [...entries].sort((first, second) =>
    second.updatedAt.localeCompare(first.updatedAt)
  );

export const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const loadedEntries = await loadEntries();

        if (isMounted) {
          setEntries(sortByUpdatedAt(loadedEntries));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const persist = async (nextEntries: Entry[]) => {
    const sortedEntries = sortByUpdatedAt(nextEntries);
    setEntries(sortedEntries);
    await saveEntries(sortedEntries);
  };

  const addEntry = async (draft: EntryDraft) => {
    setIsSaving(true);

    try {
      const timestamp = new Date().toISOString();
      const nextEntry: Entry = {
        id: `${Date.now()}`,
        title: draft.title.trim(),
        episode: draft.episode.trim(),
        link: draft.link.trim(),
        seriesStatus: draft.seriesStatus ?? 'ongoing',
        coverImage: draft.coverImage.trim(),
        localImageUri: draft.localImageUri?.trim() || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await persist([nextEntry, ...entries]);
    } finally {
      setIsSaving(false);
    }
  };

  const updateEntry = async (entryId: string, draft: EntryDraft) => {
    setIsSaving(true);

    try {
      const updatedEntries = entries.map((entry) => {
        if (entry.id !== entryId) {
          return entry;
        }

        const episode = draft.episode.trim();
        const link = draft.link.trim();

        return {
              ...entry,
              title: draft.title.trim(),
              episode,
              link,
              seriesStatus: draft.seriesStatus ?? 'ongoing',
              coverImage: draft.coverImage.trim(),
              localImageUri: draft.localImageUri?.trim() || undefined,
              linkCheck:
                episode === entry.episode && link === entry.link
                  ? entry.linkCheck
                  : undefined,
              updatedAt: new Date().toISOString(),
            };
      });

      await persist(updatedEntries);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    setIsSaving(true);

    try {
      const nextEntries = entries.filter((entry) => entry.id !== entryId);
      await persist(nextEntries);
    } finally {
      setIsSaving(false);
    }
  };

  const importEntries = async (drafts: EntryDraft[]) => {
    setIsSaving(true);

    try {
      const timestamp = new Date().toISOString();
      const existingByTitle = new Map(
        entries.map((entry) => [entry.title.trim().toLowerCase(), entry])
      );

      let createdCount = 0;
      let updatedCount = 0;
      const nextEntries = [...entries];

      for (const draft of drafts) {
        const normalizedTitle = draft.title.trim().toLowerCase();
        if (!normalizedTitle) {
          continue;
        }

        const existingEntry = existingByTitle.get(normalizedTitle);

        if (existingEntry) {
          const updatedEntry: Entry = {
            ...existingEntry,
            title: draft.title.trim(),
            episode: draft.episode.trim(),
            link: draft.link.trim(),
            seriesStatus:
              draft.seriesStatus ?? existingEntry.seriesStatus ?? 'ongoing',
            coverImage: draft.coverImage.trim() || existingEntry.coverImage,
            localImageUri: draft.localImageUri?.trim() || existingEntry.localImageUri,
            linkCheck:
              draft.episode.trim() === existingEntry.episode &&
              draft.link.trim() === existingEntry.link
                ? existingEntry.linkCheck
                : undefined,
            updatedAt: timestamp,
          };

          const entryIndex = nextEntries.findIndex(
            (entry) => entry.id === existingEntry.id
          );

          if (entryIndex >= 0) {
            nextEntries[entryIndex] = updatedEntry;
          }

          existingByTitle.set(normalizedTitle, updatedEntry);
          updatedCount += 1;
          continue;
        }

        const nextEntry: Entry = {
          id: `${Date.now()}-${createdCount}-${updatedCount}`,
          title: draft.title.trim(),
          episode: draft.episode.trim(),
          link: draft.link.trim(),
          seriesStatus: draft.seriesStatus ?? 'ongoing',
          coverImage: draft.coverImage.trim(),
          localImageUri: draft.localImageUri?.trim() || undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        nextEntries.push(nextEntry);
        existingByTitle.set(normalizedTitle, nextEntry);
        createdCount += 1;
      }

      await persist(nextEntries);

      return {
        createdCount,
        updatedCount,
      };
    } finally {
      setIsSaving(false);
    }
  };

  const clearEntries = async () => {
    setIsSaving(true);

    try {
      await clearStoredEntries();
      setEntries([]);
    } finally {
      setIsSaving(false);
    }
  };

  const saveLinkCheck = async (entryId: string, linkCheck: LinkCheck) => {
    const nextEntries = entries.map((entry) =>
      entry.id === entryId ? { ...entry, linkCheck } : entry
    );

    // ponytail: keep manual updatedAt stable; this is metadata from the local checker.
    await persist(nextEntries);
  };

  return {
    entries,
    isLoading,
    isSaving,
    addEntry,
    updateEntry,
    deleteEntry,
    importEntries,
    clearEntries,
    saveLinkCheck,
  };
};
