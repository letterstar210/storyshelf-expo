import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const COVER_DIRECTORY_NAME = 'covers';

const getExtension = (fileName?: string | null, mimeType?: string | null) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();

  if (extension && /^(jpe?g|png|gif|webp)$/.test(extension)) {
    return extension === 'jpeg' ? 'jpg' : extension;
  }

  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
};

export const persistLocalCover = async (
  sourceUri: string,
  fileName?: string | null,
  mimeType?: string | null
) => {
  // Browser-selected files are owned by the browser; native cache files must be copied.
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return sourceUri;
  }

  if (sourceUri.startsWith(FileSystem.documentDirectory)) {
    return sourceUri;
  }

  const coverDirectory = `${FileSystem.documentDirectory}${COVER_DIRECTORY_NAME}/`;
  await FileSystem.makeDirectoryAsync(coverDirectory, { intermediates: true });

  const extension = getExtension(fileName ?? sourceUri, mimeType);
  const targetUri = `${coverDirectory}cover-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;

  await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
  return targetUri;
};

export const needsPersistentCoverCopy = (uri?: string) => {
  if (Platform.OS === 'web' || !uri || !FileSystem.documentDirectory) {
    return false;
  }

  const isLocalUri = uri.startsWith('file://') || uri.startsWith('content://');
  return isLocalUri && !uri.startsWith(FileSystem.documentDirectory);
};
