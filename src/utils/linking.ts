import { Alert, Linking } from 'react-native';
import { AppLanguage, getCopy } from '../constants/localization';

const normalizeUrl = (url: string) => {
  const trimmedUrl = url.trim();
  return trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
};

export const openEntryLink = async (
  url: string,
  language: AppLanguage = 'th'
) => {
  const copy = getCopy(language);

  if (!url.trim()) {
    Alert.alert(copy.noLinkTitle, copy.noLinkMessage);
    return;
  }

  const normalizedUrl = normalizeUrl(url);

  try {
    const supported = await Linking.canOpenURL(normalizedUrl);

    if (!supported) {
      Alert.alert(copy.cannotOpenLinkTitle, copy.cannotOpenLinkMessage);
      return;
    }

    await Linking.openURL(normalizedUrl);
  } catch (error) {
    Alert.alert(copy.openLinkFailedTitle, copy.openLinkFailedMessage);
  }
};
