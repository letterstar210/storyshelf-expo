import * as XLSX from 'xlsx';
import { EntryDraft } from '../types/entry';

export interface ParsedImportEntry extends EntryDraft {
  importImageKey?: string;
}

export interface ImportedWorkbookResult {
  entries: ParsedImportEntry[];
  skippedRows: number;
  skippedCoverCount: number;
}

interface ParseWorkbookOptions {
  includeRemoteImages?: boolean;
  mode?: 'normal' | 'special' | 'zip';
  resolveImageKey?: (rawValue: string) => string | null;
}

const HEADER_ALIASES: Record<string, keyof EntryDraft | 'ignore'> = {
  ['\u0e0a\u0e37\u0e48\u0e2d\u0e40\u0e23\u0e37\u0e48\u0e2d\u0e07']: 'title',
  title: 'title',
  name: 'title',
  ['\u0e23\u0e39\u0e1b\u0e1b\u0e01']: 'coverImage',
  cover: 'coverImage',
  coverimage: 'coverImage',
  image: 'coverImage',
  ['\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48']: 'episode',
  episode: 'episode',
  chapter: 'episode',
  ['\u0e25\u0e34\u0e07\u0e04\u0e4c\u0e15\u0e2d\u0e19\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14']: 'link',
  ['\u0e25\u0e34\u0e07\u0e01\u0e4c\u0e15\u0e2d\u0e19\u0e25\u0e48\u0e32\u0e2a\u0e38\u0e14']: 'link',
  link: 'link',
  url: 'link',
};

const SPECIAL_DRIVE_FOLDER_ID = '1dHbWAGyu0FPyNCkhnSVvhf1mYbzcFfwg';

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

const isRemoteImage = (value: string) => /^https?:\/\//i.test(value.trim());

const toText = (value: unknown) => {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return String(value).trim();
};

const encodeFileName = (fileName: string) =>
  encodeURIComponent(fileName).replace(/%2F/g, '/');

const buildSpecialDriveImageUrl = (rawValue: string) => {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return '';
  }

  if (isRemoteImage(trimmedValue)) {
    return trimmedValue;
  }

  const normalized = trimmedValue.replace(/\\/g, '/');
  const fileName = normalized.split('/').pop()?.trim();
  if (!fileName) {
    return '';
  }

  return `https://googledrive.com/host/${SPECIAL_DRIVE_FOLDER_ID}/${encodeFileName(fileName)}`;
};

const mapCoverImage = (
  textValue: string,
  includeRemoteImages: boolean,
  mode: 'normal' | 'special' | 'zip',
  resolveImageKey?: (rawValue: string) => string | null
) => {
  const emptyResult = {
    coverImage: '',
    importImageKey: undefined as string | undefined,
  };

  if (!includeRemoteImages) {
    return emptyResult;
  }

  if (mode === 'zip') {
    const importImageKey = resolveImageKey?.(textValue) ?? null;
    if (!importImageKey) {
      return emptyResult;
    }

    return {
      coverImage: '',
      importImageKey,
    };
  }

  if (mode === 'special') {
    return {
      coverImage: buildSpecialDriveImageUrl(textValue),
      importImageKey: undefined,
    };
  }

  return {
    coverImage: isRemoteImage(textValue) ? textValue : '',
    importImageKey: undefined,
  };
};

export const parseWorkbookEntries = (
  base64: string,
  options: ParseWorkbookOptions = {}
): ImportedWorkbookResult => {
  const workbook = XLSX.read(base64, { type: 'base64' });
  const importedEntries: EntryDraft[] = [];
  let skippedRows = 0;
  let skippedCoverCount = 0;
  const includeRemoteImages = options.includeRemoteImages ?? true;
  const mode = options.mode ?? 'normal';
  const resolveImageKey = options.resolveImageKey;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    });

    if (!rows.length) {
      continue;
    }

    const headerRow = (rows[0] ?? []).map((cell) => normalizeHeader(cell));
    const headerMap = headerRow.map((header) => HEADER_ALIASES[header] ?? null);
    const hasKnownHeaders = headerMap.some(Boolean);

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] ?? [];
      const draft: ParsedImportEntry = {
        title: '',
        episode: '',
        link: '',
        coverImage: '',
      };

      if (hasKnownHeaders) {
        for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
          const mappedField = headerMap[columnIndex];
          if (!mappedField || mappedField === 'ignore') {
            continue;
          }

          const textValue = toText(row[columnIndex]);
          if (!textValue) {
            continue;
          }

          if (mappedField === 'coverImage') {
            const mappedCover = mapCoverImage(
              textValue,
              includeRemoteImages,
              mode,
              resolveImageKey
            );
            if (mappedCover.coverImage || mappedCover.importImageKey) {
              draft.coverImage = mappedCover.coverImage;
              draft.importImageKey = mappedCover.importImageKey;
            } else {
              skippedCoverCount += 1;
            }
            continue;
          }

          draft[mappedField] = textValue;
        }
      } else {
        // Fallback for exported/special files: assume first 4 columns are
        // title, cover path or URL, episode, and latest link respectively.
        const title = toText(row[0]);
        const coverSource = toText(row[1]);
        const episode = toText(row[2]);
        const link = toText(row[3]);

        draft.title = title;
        draft.episode = episode;
        draft.link = link;

        if (coverSource) {
          const mappedCover = mapCoverImage(
            coverSource,
            includeRemoteImages,
            mode,
            resolveImageKey
          );
          if (mappedCover.coverImage || mappedCover.importImageKey) {
            draft.coverImage = mappedCover.coverImage;
            draft.importImageKey = mappedCover.importImageKey;
          } else {
            skippedCoverCount += 1;
          }
        }
      }

      if (!draft.title.trim()) {
        skippedRows += 1;
        continue;
      }

      importedEntries.push(draft);
    }
  }

  return {
    entries: importedEntries,
    skippedRows,
    skippedCoverCount,
  };
};
