import { Alert, Platform } from 'react-native';
import { AppLanguage, getCopy } from '../constants/localization';

interface ImageSourcePickerOptions {
  onTakePhoto: () => void;
  onPickFromLibrary: () => void;
}

export const showImageSourcePicker = ({
  onTakePhoto,
  onPickFromLibrary,
}: ImageSourcePickerOptions, language: AppLanguage = 'th') => {
  const copy = getCopy(language);
  Alert.alert(
    copy.chooseCoverImage,
    copy.imageSourceMessage,
    [
      {
        text: copy.cancel,
        style: 'cancel',
      },
      {
        text: copy.takePhoto,
        onPress: onTakePhoto,
      },
      {
        text: copy.chooseFromLibrary,
        onPress: onPickFromLibrary,
      },
    ]
  );
};

export const confirmDeleteEntry = (
  onConfirm: () => void,
  language: AppLanguage = 'th'
) => {
  const copy = getCopy(language);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm(copy.confirmWebDelete)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(copy.deleteEntryTitle, copy.deleteEntryMessage, [
    {
      text: copy.cancel,
      style: 'cancel',
    },
    {
      text: copy.delete,
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
};

export const confirmClearLibrary = (
  onConfirm: () => void,
  language: AppLanguage = 'th'
) => {
  const copy = getCopy(language);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm(copy.confirmWebClear)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(
    copy.clearLibraryTitle,
    copy.clearLibraryMessage,
    [
      {
        text: copy.cancel,
        style: 'cancel',
      },
      {
        text: copy.clearAll,
        style: 'destructive',
        onPress: onConfirm,
      },
    ]
  );
};
