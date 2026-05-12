import JSZip from 'jszip';
import {
  ParsedImportEntry,
  parseWorkbookEntries,
} from './importWorkbook';

export interface ArchiveImportEntry extends ParsedImportEntry {
  importImageBase64?: string;
  importImageFileName?: string;
  importImageMimeType?: string;
}

export interface ParsedImportArchiveResult {
  workbookFileName: string;
  entries: ArchiveImportEntry[];
  skippedRows: number;
  skippedCoverCount: number;
  matchedCoverCount: number;
}

const WORKBOOK_PATTERN = /\.(xlsx|xls)$/i;
const IMAGE_PATTERN = /\.(png|jpe?g|gif|webp)$/i;

const normalizePath = (value: string) =>
  value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/\/+/g, '/')
    .toLowerCase();

const getFileName = (value: string) => {
  const normalized = value.replace(/\\/g, '/');
  return normalized.split('/').pop()?.trim() ?? '';
};

const getMimeType = (fileName: string) => {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.png')) {
    return 'image/png';
  }

  if (lowerName.endsWith('.gif')) {
    return 'image/gif';
  }

  if (lowerName.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
};

export const parseImportArchive = async (
  base64: string
): Promise<ParsedImportArchiveResult> => {
  const archive = await JSZip.loadAsync(base64, { base64: true });
  const files = Object.values(archive.files).filter((file) => !file.dir);

  const workbookFile = files.find((file) => WORKBOOK_PATTERN.test(file.name));
  if (!workbookFile) {
    throw new Error('ZIP archive does not contain an Excel workbook.');
  }

  const workbookBase64 = await workbookFile.async('base64');

  const imageFiles = files.filter((file) => IMAGE_PATTERN.test(file.name));
  const imageFileByPath = new Map<string, JSZip.JSZipObject>();
  const imageFileByName = new Map<string, JSZip.JSZipObject>();

  for (const file of imageFiles) {
    const normalizedPath = normalizePath(file.name);
    const normalizedName = getFileName(normalizedPath);

    imageFileByPath.set(normalizedPath, file);

    if (!imageFileByName.has(normalizedName)) {
      imageFileByName.set(normalizedName, file);
    }
  }

  const resolveImageKey = (rawValue: string) => {
    const normalizedPath = normalizePath(rawValue);
    if (!normalizedPath) {
      return null;
    }

    const directMatch = imageFileByPath.get(normalizedPath);
    if (directMatch) {
      return normalizePath(directMatch.name);
    }

    for (const key of imageFileByPath.keys()) {
      if (key.endsWith(`/${normalizedPath}`) || key.endsWith(normalizedPath)) {
        return key;
      }
    }

    const normalizedName = getFileName(normalizedPath);
    if (!normalizedName) {
      return null;
    }

    const nameMatch = imageFileByName.get(normalizedName);
    return nameMatch ? normalizePath(nameMatch.name) : null;
  };

  const parsedWorkbook = parseWorkbookEntries(workbookBase64, {
    includeRemoteImages: true,
    mode: 'zip',
    resolveImageKey,
  });

  const entries: ArchiveImportEntry[] = [];
  let matchedCoverCount = 0;

  for (const entry of parsedWorkbook.entries) {
    if (!entry.importImageKey) {
      entries.push(entry);
      continue;
    }

    const file = imageFileByPath.get(entry.importImageKey);
    if (!file) {
      entries.push(entry);
      continue;
    }

    matchedCoverCount += 1;

    entries.push({
      ...entry,
      importImageBase64: await file.async('base64'),
      importImageFileName: getFileName(file.name),
      importImageMimeType: getMimeType(file.name),
    });
  }

  return {
    workbookFileName: getFileName(workbookFile.name),
    entries,
    skippedRows: parsedWorkbook.skippedRows,
    skippedCoverCount: parsedWorkbook.skippedCoverCount,
    matchedCoverCount,
  };
};
