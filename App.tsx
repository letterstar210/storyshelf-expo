import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  findNodeHandle,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { File as ExpoFile } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import { EntryCard } from './src/components/EntryCard';
import { EmptyState } from './src/components/EmptyState';
import { EntryForm, EntryFormValues } from './src/components/EntryForm';
import {
  PageSize,
  PageSizeSelector,
  PaginationControls,
} from './src/components/PaginationControls';
import { ScreenHeader } from './src/components/ScreenHeader';
import { SearchBar } from './src/components/SearchBar';
import {
  AppLanguage,
  getCopy,
  replaceCount,
} from './src/constants/localization';
import { AppTheme } from './src/constants/theme';
import { useEntries } from './src/hooks/useEntries';
import { Entry, EntryDraft } from './src/types/entry';
import {
  confirmClearLibrary,
  confirmDeleteEntry,
  showImageSourcePicker,
} from './src/utils/alerts';
import {
  ArchiveImportEntry,
  parseImportArchive,
} from './src/utils/importArchive';
import {
  EntrySortOption,
  filterEntries,
  getSortDescription,
  getSortLabel,
  sortEntries,
  validateEntryDraft,
} from './src/utils/entries';
import { parseWorkbookEntries } from './src/utils/importWorkbook';
import { openEntryLink } from './src/utils/linking';
import { checkLink } from './src/services/linkChecker';
const LANGUAGE_STORAGE_KEY = 'app_language';
const PAGE_SIZE_STORAGE_KEY = 'library_page_size';
const LINK_CHECKER_URL_STORAGE_KEY = 'link_checker_url';
// ponytail: this PC is the only local checker host; change it after the router assigns a new IP.
const DEFAULT_LINK_CHECKER_URL = 'http://192.168.1.100:4317';

const EMPTY_FORM: EntryFormValues = {
  title: '',
  episode: '',
  link: '',
  seriesStatus: 'ongoing',
  coverImage: '',
  localImageUri: null,
};

type LibraryStatusFilter = 'all' | Entry['seriesStatus'];

const getFileExtension = (fileName: string) => {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() ?? '' : '';
};

const getFileNameFromUri = (uri: string) => {
  const normalizedUri = uri.replace(/\\/g, '/');
  return normalizedUri.split('/').pop() ?? 'selected-file';
};

const getPickedFileName = (value: { uri?: string } & Record<string, unknown>) => {
  const name =
    typeof value.name === 'string' && value.name.trim() ? value.name.trim() : '';

  if (name) {
    return name;
  }

  return value.uri ? getFileNameFromUri(value.uri) : 'selected-file';
};

const getReadableErrorMessage = (
  error: unknown,
  language: AppLanguage = 'th'
) => {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim();

    switch (message) {
      case 'Unable to read file data.':
        return getCopy(language).fileReadError;
      case 'ZIP archive does not contain an Excel workbook.':
        return getCopy(language).zipMissingWorkbookError;
      default:
        return message;
    }
  }

  return getCopy(language).unknownError;
};

const readWebFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] ?? '' : result;

      if (!base64) {
        reject(new Error('Unable to read file data.'));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Unable to read file data.'));
    };

    reader.readAsDataURL(file);
  });

const pickWebFile = (accept: string) =>
  new Promise<File | null>((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';

    input.onchange = () => {
      resolve(input.files?.[0] ?? null);
      input.remove();
    };

    input.oncancel = () => {
      resolve(null);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  });

const stripImportFields = ({
  importImageBase64,
  importImageFileName,
  importImageKey,
  importImageMimeType,
  ...draft
}: ArchiveImportEntry): EntryDraft => draft;

const hydrateArchiveImagesForWeb = (drafts: ArchiveImportEntry[]) => {
  let attachedCount = 0;

  const nextDrafts = drafts.map((draft) => {
    if (!draft.importImageBase64 || !draft.importImageMimeType) {
      return stripImportFields(draft);
    }

    attachedCount += 1;

    return {
      ...stripImportFields(draft),
      coverImage: `data:${draft.importImageMimeType};base64,${draft.importImageBase64}`,
    };
  });

  return {
    drafts: nextDrafts,
    attachedCount,
  };
};

export default function App() {
  const {
    entries,
    isLoading,
    isSaving,
    addEntry,
    updateEntry,
    deleteEntry,
    importEntries,
    clearEntries,
    saveLinkCheck,
    saveLinkChecks,
  } = useEntries();

  const [language, setLanguage] = useState<AppLanguage>('th');
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState<EntrySortOption>('latest');
  const [statusFilter, setStatusFilter] = useState<LibraryStatusFilter>('all');
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [formValues, setFormValues] = useState<EntryFormValues>(EMPTY_FORM);
  const [importOptionsVisible, setImportOptionsVisible] = useState(false);
  const [specialImportUnlocked, setSpecialImportUnlocked] = useState(false);
  const [excelTapCount, setExcelTapCount] = useState(0);
  const [isSyncingUpdate, setIsSyncingUpdate] = useState(false);
  const [linkCheckerUrl, setLinkCheckerUrl] = useState(DEFAULT_LINK_CHECKER_URL);
  const [linkCheckerDraftUrl, setLinkCheckerDraftUrl] = useState(DEFAULT_LINK_CHECKER_URL);
  const [isLinkCheckerSettingsVisible, setIsLinkCheckerSettingsVisible] = useState(false);
  const [isLibraryToolsVisible, setIsLibraryToolsVisible] = useState(false);
  const [checkingEntryId, setCheckingEntryId] = useState<string | null>(null);
  const [isCheckingAllLinks, setIsCheckingAllLinks] = useState(false);
  const [linkCheckProgress, setLinkCheckProgress] = useState({ current: 0, total: 0 });
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [importResult, setImportResult] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const listRef = useRef<FlatList<Entry> | null>(null);
  const formScrollRef = useRef<ScrollView | null>(null);
  const copy = useMemo(() => getCopy(language), [language]);
  const totalEntriesText = `${entries.length} ${copy.entries}`;

  const supportedColumnsText = useMemo(
    () =>
      [
        copy.supportedColumnsTitle,
        ...copy.supportedColumns.map((item) => `- ${item}`),
      ].join('\n'),
    [copy]
  );

  const specialZipHelpText = useMemo(
    () =>
      [
        copy.specialZipFormatTitle,
        ...copy.specialZipFormat.map((item) => `- ${item}`),
      ].join('\n'),
    [copy]
  );

  const filteredEntries = useMemo(
    () => sortEntries(filterEntries(entries, searchText), sortOption),
    [entries, searchText, sortOption]
  );
  const visibleEntries = useMemo(
    () => statusFilter === 'all' ? filteredEntries : filteredEntries.filter((entry) => entry.seriesStatus === statusFilter),
    [filteredEntries, statusFilter]
  );
  const statusCounts = useMemo(() => ({
    ongoing: entries.filter((entry) => entry.seriesStatus !== 'completed' && entry.seriesStatus !== 'discontinued').length,
    completed: entries.filter((entry) => entry.seriesStatus === 'completed').length,
    discontinued: entries.filter((entry) => entry.seriesStatus === 'discontinued').length,
  }), [entries]);
  const totalPages = Math.max(1, Math.ceil(visibleEntries.length / pageSize));
  const paginatedEntries = useMemo(() => {
    const firstEntryIndex = (currentPage - 1) * pageSize;
    return visibleEntries.slice(firstEntryIndex, firstEntryIndex + pageSize);
  }, [currentPage, pageSize, visibleEntries]);

  const isEditing = Boolean(editingEntry);

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const storedPageSize = Number(
        await AsyncStorage.getItem(PAGE_SIZE_STORAGE_KEY)
      );
      const storedLinkCheckerUrl =
        (await AsyncStorage.getItem(LINK_CHECKER_URL_STORAGE_KEY)) ?? '';

      if (
        isMounted &&
        (storedLanguage === 'th' || storedLanguage === 'en')
      ) {
        setLanguage(storedLanguage);
      }

      if (
        isMounted &&
        (storedPageSize === 10 ||
          storedPageSize === 20 ||
          storedPageSize === 50 ||
          storedPageSize === 100)
      ) {
        setPageSize(storedPageSize);
      }

      if (isMounted) {
        const nextLinkCheckerUrl = storedLinkCheckerUrl || DEFAULT_LINK_CHECKER_URL;
        setLinkCheckerUrl(nextLinkCheckerUrl);
        setLinkCheckerDraftUrl(nextLinkCheckerUrl);
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  const changeLanguage = async (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const resetForm = () => {
    setFormValues(EMPTY_FORM);
    setEditingEntry(null);
    setIsFormVisible(false);
  };

  const showCreateForm = () => {
    setEditingEntry(null);
    setFormValues(EMPTY_FORM);
    setIsFormVisible(true);
  };

  const showImportResult = (title: string, message: string) => {
    setImportResult({
      visible: true,
      title,
      message,
    });
  };

  const startEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setFormValues({
      title: entry.title,
      episode: entry.episode,
      link: entry.link,
      seriesStatus: entry.seriesStatus ?? 'ongoing',
      coverImage: entry.coverImage,
      localImageUri: entry.localImageUri ?? null,
    });
    setIsFormVisible(true);
  };

  const handleToggleForm = () => {
    if (isFormVisible) {
      resetForm();
      return;
    }

    showCreateForm();
  };

  const handleListScroll = (offsetY: number) => {
    setShowScrollTopButton(offsetY > 520);
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset?.({
      offset: 0,
      animated: true,
    });
  };

  const handleExcelSecretTap = () => {
    const nextCount = excelTapCount + 1;

    if (nextCount >= 4) {
      setSpecialImportUnlocked(true);
      setExcelTapCount(0);
      showImportResult(
        copy.specialZipUnlockedTitle,
        copy.specialZipUnlockedMessage
      );
      return;
    }

    setExcelTapCount(nextCount);
  };

  const handlePickFromLibrary = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(copy.photoPermissionTitle, copy.photoPermissionMessage);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        setFormValues((current) => ({
          ...current,
          localImageUri: result.assets[0].uri,
          coverImage: '',
        }));
      }
    } catch (error) {
      Alert.alert(copy.unableToPickImageTitle, copy.unableToPickImageMessage);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(copy.cameraPermissionTitle, copy.cameraPermissionMessage);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        setFormValues((current) => ({
          ...current,
          localImageUri: result.assets[0].uri,
          coverImage: '',
        }));
      }
    } catch (error) {
      Alert.alert(copy.unableToTakePhotoTitle, copy.unableToTakePhotoMessage);
    }
  };

  const handleOpenImageOptions = () => {
    showImageSourcePicker(
      {
        onTakePhoto: handleTakePhoto,
        onPickFromLibrary: handlePickFromLibrary,
      },
      language
    );
  };

  const handleChangeForm = <K extends keyof EntryFormValues>(
    key: K,
    value: EntryFormValues[K]
  ) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const showLinkCheckerSettings = () => {
    setLinkCheckerDraftUrl(linkCheckerUrl);
    setIsLinkCheckerSettingsVisible(true);
  };

  const saveLinkCheckerUrl = async () => {
    const normalizedUrl = linkCheckerDraftUrl.trim().replace(/\/+$/, '');

    try {
      const url = new URL(normalizedUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid URL');
      }
    } catch {
      Alert.alert(copy.linkCheckerSetupTitle, copy.linkCheckerInvalidUrl);
      return;
    }

    setLinkCheckerUrl(normalizedUrl);
    await AsyncStorage.setItem(LINK_CHECKER_URL_STORAGE_KEY, normalizedUrl);
    setIsLinkCheckerSettingsVisible(false);
  };

  const requestLinkCheck = async (entry: Entry) => {
    try {
      return await checkLink(linkCheckerUrl, entry.link, entry.episode);
    } catch (error) {
      if (linkCheckerUrl === DEFAULT_LINK_CHECKER_URL) {
        throw error;
      }

      // ponytail: recover from a stale address saved by an earlier network adapter.
      const result = await checkLink(
        DEFAULT_LINK_CHECKER_URL,
        entry.link,
        entry.episode
      );
      setLinkCheckerUrl(DEFAULT_LINK_CHECKER_URL);
      setLinkCheckerDraftUrl(DEFAULT_LINK_CHECKER_URL);
      await AsyncStorage.setItem(
        LINK_CHECKER_URL_STORAGE_KEY,
        DEFAULT_LINK_CHECKER_URL
      );
      return result;
    }
  };

  const handleCheckLink = async (entry: Entry) => {
    if (checkingEntryId || isCheckingAllLinks) {
      return;
    }

    if (!linkCheckerUrl) {
      showLinkCheckerSettings();
      return;
    }

    setCheckingEntryId(entry.id);

    try {
      const linkCheck = await requestLinkCheck(entry);
      await saveLinkCheck(entry.id, linkCheck);
    } catch (error) {
      const message = getReadableErrorMessage(error, language);
      await saveLinkCheck(entry.id, {
        status: 'check-failed',
        checkedAt: new Date().toISOString(),
        message,
      });
      Alert.alert(
        copy.linkCheckerUnavailableTitle,
        `${copy.linkCheckerUnavailableMessage}\n\n${message}`
      );
    } finally {
      setCheckingEntryId(null);
    }
  };

  const handleCheckAllLinks = async () => {
    if (checkingEntryId || isCheckingAllLinks) {
      return;
    }

    if (!linkCheckerUrl) {
      showLinkCheckerSettings();
      return;
    }

    const entriesWithLinks = entries.filter((entry) => entry.link.trim());
    const checks = new Map<Entry['id'], NonNullable<Entry['linkCheck']>>();

    setIsCheckingAllLinks(true);
    setLinkCheckProgress({ current: 0, total: entriesWithLinks.length });

    try {
      for (const [index, entry] of entriesWithLinks.entries()) {
        setCheckingEntryId(entry.id);

        try {
          checks.set(
            entry.id,
            await requestLinkCheck(entry)
          );
        } catch (error) {
          checks.set(entry.id, {
            status: 'check-failed',
            checkedAt: new Date().toISOString(),
            message: error instanceof Error ? error.message : undefined,
          });
        }

        setLinkCheckProgress({ current: index + 1, total: entriesWithLinks.length });
      }

      if (checks.size > 0) {
        await saveLinkChecks(checks);
      }

      Alert.alert(
        copy.linkCheckAllCompleteTitle,
        replaceCount(copy.linkCheckAllCompleteMessage, checks.size)
      );
    } finally {
      setCheckingEntryId(null);
      setIsCheckingAllLinks(false);
    }
  };

  const handlePageSizeChange = async (nextPageSize: PageSize) => {
    setPageSize(nextPageSize);
    setCurrentPage(1);
    await AsyncStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(nextPageSize));
  };

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setCurrentPage(safePage);
    listRef.current?.scrollToOffset?.({
      offset: 0,
      animated: true,
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, searchText, sortOption, statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const scrollFocusedFieldIntoView = (target: number | null) => {
    if (Platform.OS === 'web' || !target) {
      return;
    }

    const scrollNode = findNodeHandle(formScrollRef.current);

    if (!scrollNode) {
      return;
    }

    setTimeout(() => {
      UIManager.measureLayout(
        target,
        scrollNode,
        () => undefined,
        (_left, top) => {
          formScrollRef.current?.scrollTo({
            y: Math.max(0, top - 24),
            animated: true,
          });
        }
      );
    }, 180);
  };

  const handleSubmit = async () => {
    const draft: EntryDraft = {
      title: formValues.title,
      episode: formValues.episode,
      link: formValues.link,
      seriesStatus: formValues.seriesStatus,
      coverImage: formValues.coverImage,
      localImageUri: formValues.localImageUri ?? undefined,
    };

    const validationError = validateEntryDraft(draft, language);
    if (validationError) {
      Alert.alert(copy.missingInformation, validationError);
      return;
    }

    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, draft);
        Alert.alert(copy.savedTitle, copy.savedMessage);
      } else {
        await addEntry(draft);
        Alert.alert(copy.addedTitle, copy.addedMessage);
      }

      setCurrentPage(1);
      resetForm();
    } catch (error) {
      Alert.alert(copy.saveFailedTitle, copy.saveFailedMessage);
    }
  };

  const handleDelete = (entryId: string) => {
    confirmDeleteEntry(async () => {
      try {
        await deleteEntry(entryId);

        if (editingEntry?.id === entryId) {
          resetForm();
        }
      } catch (error) {
        Alert.alert(copy.deleteFailedTitle, copy.deleteFailedMessage);
      }
    }, language);
  };

  const handleClearLibrary = () => {
    confirmClearLibrary(async () => {
      try {
        await clearEntries();
        setSearchText('');
        setCurrentPage(1);
        resetForm();
        showImportResult(copy.libraryClearedTitle, copy.libraryClearedMessage);
      } catch (error) {
        showImportResult(copy.clearFailedTitle, copy.clearFailedMessage);
      }
    }, language);
  };

  const pickDocumentBase64 = async (type: 'workbook' | 'zip') => {
    if (Platform.OS === 'web') {
      const file = await pickWebFile(type === 'zip' ? '.zip' : '.xlsx,.xls');

      if (!file) {
        return null;
      }

      const extension = getFileExtension(file.name);

      if (type === 'zip' && extension !== 'zip') {
        showImportResult(copy.chooseZipTitle, copy.chooseZipMessage);
        return null;
      }

      if (type === 'workbook' && extension !== 'xlsx' && extension !== 'xls') {
        showImportResult(copy.chooseExcelTitle, copy.chooseExcelMessage);
        return null;
      }

      return {
        base64: await readWebFileAsBase64(file),
        asset: {
          name: file.name,
          uri: '',
        },
      };
    }

    if (Platform.OS === 'android' && type === 'zip') {
      try {
        const pickedFileResult = await ExpoFile.pickFileAsync(undefined, '*/*');
        const pickedFile = Array.isArray(pickedFileResult)
          ? pickedFileResult[0]
          : pickedFileResult;

        if (!pickedFile) {
          return null;
        }

        const fileName = getPickedFileName(
          pickedFile as unknown as { uri?: string } & Record<string, unknown>
        );

        const base64 =
          typeof (pickedFile as { base64?: () => Promise<string> }).base64 ===
          'function'
            ? await (pickedFile as { base64: () => Promise<string> }).base64()
            : await FileSystem.readAsStringAsync(pickedFile.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });

        return {
          base64,
          asset: {
            name: fileName,
            uri: pickedFile.uri,
          },
        };
      } catch (error) {
        showImportResult(
          copy.androidZipReadFailedTitle,
          `${copy.androidZipReadFailedMessage}\n\n${getReadableErrorMessage(
            error,
            language
          )}`
        );
        return null;
      }
    }

    const result = await DocumentPicker.getDocumentAsync({
      type:
        type === 'zip'
          ? '*/*'
          : [
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
            ],
      base64: true,
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const fileAsset = result.assets[0];
    const extension = getFileExtension(fileAsset.name ?? '');

    if (type === 'zip' && Platform.OS !== 'android' && extension !== 'zip') {
      showImportResult(copy.chooseZipTitle, copy.chooseZipMessage);
      return null;
    }

    if (type === 'workbook' && extension !== 'xlsx' && extension !== 'xls') {
      showImportResult(copy.chooseExcelTitle, copy.chooseExcelMessage);
      return null;
    }

    const base64 =
      fileAsset.base64 ||
      (await FileSystem.readAsStringAsync(fileAsset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      }));

    return {
      base64,
      asset: fileAsset,
    };
  };

  const hydrateArchiveImagesToLocal = async (
    drafts: ArchiveImportEntry[]
  ) => {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      return {
        drafts: drafts.map(stripImportFields),
        savedCount: 0,
        failedCount: drafts.filter((draft) => draft.importImageBase64).length,
      };
    }

    const folderUri = `${FileSystem.documentDirectory}imported-covers/`;
    await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });

    const nextDrafts: EntryDraft[] = [];
    let savedCount = 0;
    let failedCount = 0;

    for (let index = 0; index < drafts.length; index += 1) {
      const draft = drafts[index];

      if (!draft.importImageBase64) {
        nextDrafts.push(stripImportFields(draft));
        continue;
      }

      try {
        const extension =
          draft.importImageFileName?.split('.').pop()?.toLowerCase() || 'jpg';
        const safeTitle = draft.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `entry-${index + 1}`;
        const targetUri = `${folderUri}${safeTitle}-${Date.now()}-${index}.${extension}`;

        await FileSystem.writeAsStringAsync(targetUri, draft.importImageBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        nextDrafts.push({
          ...stripImportFields(draft),
          coverImage: '',
          localImageUri: targetUri,
        });
        savedCount += 1;
      } catch (error) {
        nextDrafts.push(stripImportFields(draft));
        failedCount += 1;
      }
    }

    return {
      drafts: nextDrafts,
      savedCount,
      failedCount,
    };
  };

  const handleImportWorkbook = async (includeRemoteImages: boolean) => {
    try {
      setImportOptionsVisible(false);

      const picked = await pickDocumentBase64('workbook');
      if (!picked) {
        return;
      }

      const parsedWorkbook = parseWorkbookEntries(picked.base64, {
        includeRemoteImages,
        mode: 'normal',
      });

      if (parsedWorkbook.entries.length === 0) {
        showImportResult(
          copy.noImportableRowsTitle,
          `${supportedColumnsText}\n\n${copy.noImportableRowsExcelSuffix}`
        );
        return;
      }

      const importSummary = await importEntries(parsedWorkbook.entries);
      setCurrentPage(1);

      const detailLines = [
        `${copy.file}: ${picked.asset.name ?? copy.workbook}`,
        `${copy.addedEntries} ${importSummary.createdCount} ${copy.entries}`,
        `${copy.updatedEntries} ${importSummary.updatedCount} ${copy.entries}`,
        `${copy.imageMode}: ${
          includeRemoteImages ? copy.importRemoteImageUrlsOnly : copy.skipImages
        }`,
      ];

      if (parsedWorkbook.skippedRows > 0) {
        detailLines.push(
          replaceCount(copy.skippedRowsWithoutTitle, parsedWorkbook.skippedRows)
        );
      }

      if (parsedWorkbook.skippedCoverCount > 0) {
        detailLines.push(
          replaceCount(copy.skippedCoverValues, parsedWorkbook.skippedCoverCount)
        );
      }

      showImportResult(copy.excelImportCompleteTitle, detailLines.join('\n'));
    } catch (error) {
      showImportResult(copy.importFailedTitle, copy.importFailedMessage);
    }
  };

  const handleSyncUpdate = async () => {
    if (__DEV__) {
      showImportResult(copy.syncUnavailableTitle, copy.syncUnavailableMessage);
      return;
    }

    setIsSyncingUpdate(true);

    try {
      const updateCheck = await Updates.checkForUpdateAsync();

      if (!updateCheck.isAvailable) {
        showImportResult(copy.noUpdateFoundTitle, copy.noUpdateFoundMessage);
        return;
      }

      await Updates.fetchUpdateAsync();
      showImportResult(copy.updateDownloadedTitle, copy.updateDownloadedMessage);
      await Updates.reloadAsync();
    } catch (error) {
      showImportResult(copy.syncFailedTitle, copy.syncFailedMessage);
    } finally {
      setIsSyncingUpdate(false);
    }
  };

  const handleSpecialZipImport = async (includeImages: boolean) => {
    try {
      setImportOptionsVisible(false);

      const picked = await pickDocumentBase64('zip');
      if (!picked) {
        return;
      }

      const parsedArchive = await parseImportArchive(picked.base64);
      if (parsedArchive.entries.length === 0) {
        showImportResult(
          copy.noImportableRowsTitle,
          `${specialZipHelpText}\n\n${copy.specialZipRowsSuffix}`
        );
        return;
      }

      let draftsToImport: EntryDraft[] = parsedArchive.entries.map(stripImportFields);
      let savedCount = 0;
      let failedCount = 0;
      let attachedCount = 0;
      let imageModeLabel: string = copy.importTextOnlyMode;
      let extraNotice = '';

      if (includeImages && Platform.OS === 'web') {
        const hydrated = hydrateArchiveImagesForWeb(parsedArchive.entries);
        draftsToImport = hydrated.drafts;
        attachedCount = hydrated.attachedCount;
        imageModeLabel = copy.browserAttachMode;
        extraNotice = copy.largeZipNotice;
      } else if (includeImages) {
        const hydrated = await hydrateArchiveImagesToLocal(parsedArchive.entries);
        draftsToImport = hydrated.drafts;
        savedCount = hydrated.savedCount;
        failedCount = hydrated.failedCount;
        imageModeLabel = copy.extractToDeviceMode;
      }

      const importSummary = await importEntries(draftsToImport);
      setCurrentPage(1);
      const detailLines = [
        `${copy.zipFile}: ${picked.asset.name ?? copy.archiveFallbackName}`,
        `${copy.workbook}: ${parsedArchive.workbookFileName}`,
        `${copy.addedEntries} ${importSummary.createdCount} ${copy.entries}`,
        `${copy.updatedEntries} ${importSummary.updatedCount} ${copy.entries}`,
        `${copy.imageMode}: ${imageModeLabel}`,
      ];

      if (parsedArchive.matchedCoverCount > 0) {
        detailLines.push(
          replaceCount(copy.matchedCoverImages, parsedArchive.matchedCoverCount)
        );
      }

      if (savedCount > 0) {
        detailLines.push(replaceCount(copy.savedCoverImages, savedCount));
      }

      if (attachedCount > 0) {
        detailLines.push(replaceCount(copy.attachedCoverImages, attachedCount));
      }

      if (failedCount > 0) {
        detailLines.push(
          replaceCount(copy.failedToSaveCoverImages, failedCount)
        );
      }

      if (parsedArchive.skippedCoverCount > 0) {
        detailLines.push(
          replaceCount(copy.unmatchedCoverPaths, parsedArchive.skippedCoverCount)
        );
      }

      if (parsedArchive.skippedRows > 0) {
        detailLines.push(
          replaceCount(copy.skippedRowsWithoutTitle, parsedArchive.skippedRows)
        );
      }

      if (extraNotice) {
        detailLines.push(extraNotice);
      }

      showImportResult(
        copy.specialZipImportCompleteTitle,
        detailLines.join('\n')
      );
    } catch (error) {
      showImportResult(
        copy.specialZipImportFailedTitle,
        `${copy.specialZipImportFailedMessage}\n\n${getReadableErrorMessage(
          error,
          language
        )}`
      );
    }
  };

  const entryFormElement = (
    <EntryForm
      mode={isEditing ? 'edit' : 'create'}
      values={formValues}
      isSaving={isSaving}
      language={language}
      onChange={handleChangeForm}
      onFocusField={scrollFocusedFieldIntoView}
      onSubmit={handleSubmit}
      onCancel={resetForm}
      onPickImage={handleOpenImageOptions}
      onClearImage={() =>
        setFormValues((current) => ({
          ...current,
          localImageUri: null,
          coverImage: '',
        }))
      }
    />
  );

  const listHeader = (
    <>
      <ScreenHeader
        title={copy.appTitle}
        totalEntriesText={totalEntriesText}
        statusCounts={statusCounts}
        language={language}
        onLanguageChange={changeLanguage}
        onToggleForm={handleToggleForm}
        onToolsPress={() => setIsLibraryToolsVisible(true)}
      />

      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        resultCount={visibleEntries.length}
        sortOption={sortOption}
        onChangeSort={setSortOption}
        language={language}
      />

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{copy.library}</Text>
          <Text style={styles.sectionCaption}>
            {getSortDescription(sortOption, language)}
          </Text>
        </View>
        <View style={styles.sectionPill}>
          <Text style={styles.sectionPillText}>
            {visibleEntries.length} {copy.results.toLowerCase()} ·{' '}
            {getSortLabel(sortOption, language)}
          </Text>
        </View>
      </View>

      <View style={styles.statusFilters}>
        {([
          ['all', copy.all, 'layers-outline'],
          ['ongoing', copy.statusOngoing, 'play-circle-outline'],
          ['completed', copy.statusCompleted, 'checkmark-circle-outline'],
          ['discontinued', copy.statusDiscontinued, 'pause-circle-outline'],
        ] as const).map(([value, label, icon]) => {
          const selected = statusFilter === value;
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.statusFilterButton,
                selected && styles.statusFilterButtonActive,
              ]}
              onPress={() => setStatusFilter(value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Ionicons
                name={icon}
                size={14}
                color={selected ? AppTheme.colors.primary : AppTheme.colors.textMuted}
              />
              <Text
                style={[
                  styles.statusFilterText,
                  selected && styles.statusFilterTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <PageSizeSelector
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        copy={copy}
      />
    </>
  );

  const commonListProps = {
    ref: listRef,
    keyboardShouldPersistTaps: 'handled' as const,
    showsVerticalScrollIndicator: false,
    contentContainerStyle: styles.listContainer,
    ListHeaderComponent: listHeader,
    onScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) =>
      handleListScroll(event.nativeEvent.contentOffset.y),
    scrollEventThrottle: 16,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <Modal
        visible={isLibraryToolsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLibraryToolsVisible(false)}
      >
        <Pressable style={styles.resultOverlay} onPress={() => setIsLibraryToolsVisible(false)}>
          <Pressable style={styles.resultCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBadge}>
                <Ionicons name="options-outline" size={20} color={AppTheme.colors.primary} />
              </View>
              <Text style={styles.resultTitle}>{copy.libraryTools}</Text>
            </View>

            <View style={styles.importOptionGroup}>
              <TouchableOpacity
                style={styles.toolItemButton}
                onPress={() => {
                  setIsLibraryToolsVisible(false);
                  setImportOptionsVisible(true);
                }}
              >
                <Ionicons name="document-text-outline" size={18} color={AppTheme.colors.primary} />
                <Text style={styles.toolItemButtonText}>{copy.importExcel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolItemButton}
                onPress={() => {
                  setIsLibraryToolsVisible(false);
                  handleCheckAllLinks();
                }}
                disabled={isCheckingAllLinks}
              >
                <Ionicons name="refresh-outline" size={18} color={AppTheme.colors.secondary} />
                <Text style={styles.toolItemButtonText}>
                  {isCheckingAllLinks
                    ? `${copy.checkingLinks} ${linkCheckProgress.current}/${linkCheckProgress.total}`
                    : copy.checkAllLinks}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolItemButton}
                onPress={() => {
                  setIsLibraryToolsVisible(false);
                  showLinkCheckerSettings();
                }}
              >
                <Ionicons name="wifi-outline" size={18} color={AppTheme.colors.primary} />
                <Text style={styles.toolItemButtonText}>{copy.linkCheckerSettings}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolItemButton}
                onPress={() => {
                  setIsLibraryToolsVisible(false);
                  handleSyncUpdate();
                }}
              >
                <Ionicons name="cloud-download-outline" size={18} color={AppTheme.colors.primary} />
                <Text style={styles.toolItemButtonText}>
                  {isSyncingUpdate ? copy.syncing : copy.syncOta}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolItemButton, styles.destructiveToolItemButton]}
                onPress={() => {
                  setIsLibraryToolsVisible(false);
                  handleClearLibrary();
                }}
              >
                <Ionicons name="trash-outline" size={18} color={AppTheme.colors.danger} />
                <Text style={styles.destructiveToolItemText}>{copy.clearLibrary}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelResultButton}
                onPress={() => setIsLibraryToolsVisible(false)}
              >
                <Text style={styles.cancelResultButtonText}>{copy.cancel}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isLinkCheckerSettingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLinkCheckerSettingsVisible(false)}
      >
        <Pressable
          style={styles.resultOverlay}
          onPress={() => setIsLinkCheckerSettingsVisible(false)}
        >
          <Pressable style={styles.resultCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBadge}>
                <Ionicons name="wifi-outline" size={20} color={AppTheme.colors.primary} />
              </View>
              <Text style={styles.resultTitle}>{copy.linkCheckerSetupTitle}</Text>
            </View>

            <Text style={styles.resultMessage}>{copy.linkCheckerSetupMessage}</Text>
            <TextInput
              style={styles.linkCheckerInput}
              value={linkCheckerDraftUrl}
              onChangeText={setLinkCheckerDraftUrl}
              placeholder="http://192.168.1.20:4317"
              placeholderTextColor={AppTheme.colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              textContentType="none"
              importantForAutofill="no"
            />
            <View style={styles.linkCheckerActions}>
              <TouchableOpacity
                style={styles.cancelResultButton}
                onPress={() => setIsLinkCheckerSettingsVisible(false)}
              >
                <Text style={styles.cancelResultButtonText}>{copy.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resultButton} onPress={saveLinkCheckerUrl}>
                <Text style={styles.resultButtonText}>{copy.linkCheckerSave}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={importResult.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setImportResult((current) => ({ ...current, visible: false }))
        }
      >
        <Pressable
          style={styles.resultOverlay}
          onPress={() =>
            setImportResult((current) => ({ ...current, visible: false }))
          }
        >
          <Pressable style={styles.resultCard}>
            <Text style={styles.resultTitle}>{importResult.title}</Text>
            <Text style={styles.resultMessage}>{importResult.message}</Text>
            <TouchableOpacity
              style={styles.resultButton}
              onPress={() =>
                setImportResult((current) => ({ ...current, visible: false }))
              }
            >
              <Text style={styles.resultButtonText}>{copy.ok}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={importOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImportOptionsVisible(false)}
      >
        <Pressable
          style={styles.resultOverlay}
          onPress={() => setImportOptionsVisible(false)}
        >
          <Pressable style={styles.resultCard}>
            <View style={styles.secretTitleRow}>
              <View style={styles.modalIconBadge}>
                <Ionicons name="cloud-upload-outline" size={20} color={AppTheme.colors.primary} />
              </View>
              <Text style={styles.resultTitle}>{copy.importTitle}</Text>
              <TouchableOpacity onPress={handleExcelSecretTap} activeOpacity={0.8}>
                <Text style={[styles.resultTitle, styles.secretWord]}>Excel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.resultMessage}>
              {supportedColumnsText}
              {'\n\n'}
              {copy.exampleRow}
              {'\n'}
              {copy.supportedColumns[0]} = Solo Login
              {'\n'}
              {copy.supportedColumns[1]} = https://example.com/cover.jpg
              {'\n'}
              {copy.supportedColumns[2]} = 109
              {'\n'}
              {copy.supportedColumns[3]} = https://example.com/ch-109
              {'\n\n'}
              {copy.tip}
              {'\n'}- {copy.importTipUrl}
              {'\n'}- {copy.importTipZip}
            </Text>

            <View style={styles.importOptionGroup}>
              <TouchableOpacity
                style={styles.resultButton}
                onPress={() => handleImportWorkbook(false)}
              >
                <Text style={styles.resultButtonText}>{copy.importTextOnly}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resultButton, styles.secondaryResultButton]}
                onPress={() => handleImportWorkbook(true)}
              >
                <Text style={styles.resultButtonText}>
                  {copy.importWithImageUrls}
                </Text>
              </TouchableOpacity>

              {specialImportUnlocked ? (
                <View style={styles.secretPanel}>
                  <Text style={styles.secretPanelTitle}>{copy.specialZipTitle}</Text>
                  <Text style={styles.secretPanelText}>
                    {copy.specialZipDescription}
                  </Text>

                  <TouchableOpacity
                    style={[styles.resultButton, styles.secretActionButton]}
                    onPress={() => handleSpecialZipImport(false)}
                  >
                    <Text style={styles.resultButtonText}>{copy.zipTextOnly}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.resultButton, styles.downloadResultButton]}
                    onPress={() => handleSpecialZipImport(true)}
                  >
                    <Text style={styles.resultButtonText}>
                      {copy.zipWithImages}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.cancelResultButton}
                onPress={() => setImportOptionsVisible(false)}
              >
                <Text style={styles.cancelResultButtonText}>{copy.cancel}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <View style={styles.loaderCard}>
                <ActivityIndicator size="large" color={AppTheme.colors.primary} />
                <Text style={styles.loaderTitle}>{copy.loadingLibrary}</Text>
                <Text style={styles.loaderText}>{copy.loadingLibraryText}</Text>
              </View>
            </View>
          ) : isFormVisible ? (
            <ScrollView
              ref={formScrollRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
              contentContainerStyle={styles.formScreenContainer}
            >
              <View style={styles.formScreenHeader}>
                <TouchableOpacity
                  style={styles.formScreenCloseButton}
                  onPress={resetForm}
                  activeOpacity={0.88}
                >
                  <Text style={styles.formScreenCloseButtonText}>
                    {copy.closeForm}
                  </Text>
                </TouchableOpacity>
              </View>

              {entryFormElement}
            </ScrollView>
          ) : visibleEntries.length === 0 ? (
            <FlatList
              {...commonListProps}
              data={[] as Entry[]}
              keyExtractor={(_, index) => `empty-${index}`}
              renderItem={() => null}
              ListEmptyComponent={
                <EmptyState
                  title={
                    entries.length === 0
                      ? copy.noComicsSaved
                      : copy.noMatchingResults
                  }
                  description={
                    entries.length === 0
                      ? copy.emptyDescription
                      : copy.noResultsDescription
                  }
                  actionLabel={
                    entries.length === 0
                      ? copy.addFirstEntry
                      : copy.clearSearch
                  }
                  onActionPress={
                    entries.length === 0
                      ? showCreateForm
                      : () => {
                          setSearchText('');
                        }
                  }
                />
              }
            />
          ) : (
            <FlatList
              {...commonListProps}
              data={paginatedEntries}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={styles.cardWrapper}>
                  <EntryCard
                    entry={item}
                    editorialIndex={(currentPage - 1) * pageSize + index + 1}
                    language={language}
                    isCheckingLink={checkingEntryId === item.id}
                    onEdit={startEditEntry}
                    onDelete={handleDelete}
                    onOpenLink={(url) => openEntryLink(url, language)}
                    onCheckLink={handleCheckLink}
                  />
                </View>
              )}
              ListFooterComponent={
                totalPages > 1 ? (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    copy={copy}
                  />
                ) : null
              }
            />
          )}
        </View>

        {showScrollTopButton && !isFormVisible ? (
          <TouchableOpacity
            style={styles.scrollTopButton}
            onPress={scrollToTop}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={copy.toTop}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  backgroundBlobTop: {
    display: 'none',
  },
  backgroundBlobBottom: {
    display: 'none',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 10, android: 16, default: 16 }),
    paddingBottom: 18,
  },
  sectionHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 1,
  },
  sectionCaption: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
  },
  sectionPill: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  sectionPillText: {
    fontSize: 11,
    color: AppTheme.colors.textSecondary,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    minWidth: 240,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.xl,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  loaderTitle: {
    marginTop: 14,
    fontSize: 17,
    color: AppTheme.colors.textPrimary,
    fontWeight: '800',
  },
  loaderText: {
    marginTop: 6,
    fontSize: 13,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  listContainer: {
    paddingBottom: 96,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  resultOverlay: {
    flex: 1,
    backgroundColor: AppTheme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formScreenContainer: {
    paddingBottom: 34,
  },
  formScreenHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  formScreenCloseButton: {
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  formScreenCloseButtonText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  modalIconBadge: {
    width: 36,
    height: 36,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.xl,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 22,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  resultMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: AppTheme.colors.textSecondary,
    marginBottom: 16,
  },
  resultButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppTheme.colors.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  resultButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  linkCheckerInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 14,
    color: AppTheme.colors.textPrimary,
    fontSize: 14,
    marginBottom: 16,
  },
  linkCheckerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  importOptionGroup: {
    gap: 8,
  },
  toolItemButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 14,
  },
  toolItemButtonText: {
    color: AppTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  destructiveToolItemButton: {
    backgroundColor: AppTheme.colors.dangerSoft,
  },
  destructiveToolItemText: {
    color: AppTheme.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryResultButton: {
    backgroundColor: AppTheme.colors.secondary,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.pill,
    padding: 4,
    marginBottom: 12,
  },
  statusFilterButton: {
    flex: 1,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: AppTheme.radius.pill,
  },
  statusFilterButtonActive: {
    backgroundColor: AppTheme.colors.surface,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statusFilterText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusFilterTextActive: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
  downloadResultButton: {
    backgroundColor: AppTheme.colors.success,
  },
  cancelResultButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelResultButtonText: {
    color: AppTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  secretTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  secretWord: {
    color: AppTheme.colors.primary,
    textDecorationLine: 'underline',
  },
  secretPanel: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
    gap: 8,
  },
  secretPanelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  secretPanelText: {
    fontSize: 12,
    lineHeight: 18,
    color: AppTheme.colors.textSecondary,
  },
  secretActionButton: {
    backgroundColor: '#6366F1',
  },
  scrollTopButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.select({ ios: 30, android: 88, default: 30 }),
    width: 48,
    height: 48,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 24,
    shadowColor: AppTheme.colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
