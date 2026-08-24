import React, { useEffect, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../constants/theme';
import { AppLanguage, getCopy } from '../constants/localization';
import { SeriesStatus } from '../types/entry';

export interface EntryFormValues {
  title: string;
  episode: string;
  link: string;
  seriesStatus: SeriesStatus;
  coverImage: string;
  localImageUri: string | null;
}

interface EntryFormProps {
  mode: 'create' | 'edit';
  values: EntryFormValues;
  isSaving: boolean;
  language: AppLanguage;
  onChange: <K extends keyof EntryFormValues>(
    key: K,
    value: EntryFormValues[K]
  ) => void;
  onFocusField?: (target: number | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onPickImage: () => void;
  onClearImage: () => void;
}

export const EntryForm = ({
  mode,
  values,
  isSaving,
  language,
  onChange,
  onFocusField,
  onSubmit,
  onCancel,
  onPickImage,
  onClearImage,
}: EntryFormProps) => {
  const copy = getCopy(language);
  const previewUri = values.localImageUri || values.coverImage;
  const formRef = useRef<View | null>(null);

  const statusOptions: { value: SeriesStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'ongoing', label: copy.statusOngoing, icon: 'play-circle' },
    { value: 'completed', label: copy.statusCompleted, icon: 'checkmark-circle' },
    { value: 'discontinued', label: copy.statusDiscontinued, icon: 'pause-circle' },
  ];

  const genericInputProps = {
    autoComplete: 'off' as const,
    textContentType: 'none' as const,
    importantForAutofill: 'no' as const,
    autoCorrect: false,
    spellCheck: false,
    disableFullscreenUI: true,
    returnKeyType: 'next' as const,
    enterKeyHint: 'next' as const,
  };

  const urlInputProps = {
    ...genericInputProps,
    autoCapitalize: 'none' as const,
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const formElement = formRef.current as unknown as HTMLElement | null;
    const inputs = formElement?.querySelectorAll?.('input, textarea');

    if (!inputs?.length) {
      return;
    }

    inputs.forEach((input, index) => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('name', `reading-entry-field-${index + 1}`);
      input.setAttribute('data-form-type', 'other');
      input.setAttribute('data-lpignore', 'true');
      input.setAttribute('data-1p-ignore', 'true');
    });
  }, [mode]);

  const handleInputFocus = (event: {
    nativeEvent?: {
      target?: number | null;
    };
  }) => {
    onFocusField?.(event.nativeEvent?.target ?? null);
  };

  return (
    <View ref={formRef} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.headerIconBadge}>
            <Ionicons
              name={mode === 'edit' ? 'pencil' : 'add'}
              size={18}
              color={AppTheme.colors.primary}
            />
          </View>
          <View>
            <Text style={styles.caption}>
              {mode === 'edit' ? copy.editMode : copy.newEntry}
            </Text>
            <Text style={styles.title}>
              {mode === 'edit' ? copy.editComicEntry : copy.addComicEntry}
            </Text>
          </View>
        </View>
        <View style={styles.headerBubble}>
          <Text style={styles.headerBubbleText}>
            {mode === 'edit' ? copy.update : copy.create}
          </Text>
        </View>
      </View>

      <View style={styles.imagePanel}>
        <View style={styles.imagePanelHeader}>
          <View style={styles.labelGroup}>
            <Ionicons name="image-outline" size={16} color={AppTheme.colors.primary} />
            <Text style={styles.label}>{copy.coverImage}</Text>
          </View>
          {previewUri ? (
            <TouchableOpacity
              onPress={onClearImage}
              style={styles.clearBadge}
            >
              <Ionicons name="trash-outline" size={13} color={AppTheme.colors.danger} />
              <Text style={styles.clearInline}>{copy.clearImage}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={onPickImage}
            activeOpacity={0.82}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={28}
              color={AppTheme.colors.primary}
            />
            <Text style={styles.imagePickerButtonText}>{copy.chooseImage}</Text>
          </TouchableOpacity>

          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.emptyPreview}>
              <Ionicons
                name="image-outline"
                size={24}
                color={AppTheme.colors.textMuted}
              />
              <Text style={styles.emptyPreviewTitle}>{copy.noCoverSelected}</Text>
              <Text style={styles.emptyPreviewText}>
                {copy.noCoverSelectedText}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="link-outline" size={17} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
        <TextInput
          {...urlInputProps}
          style={styles.input}
          placeholder={copy.coverUrlOptional}
          placeholderTextColor={AppTheme.colors.placeholder}
          value={values.coverImage}
          nativeID="entry-cover-url"
          onFocus={(event) => handleInputFocus(event)}
          onChangeText={(text) => {
            onChange('coverImage', text);
            if (text.trim()) {
              onChange('localImageUri', null);
            }
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={17} color={AppTheme.colors.primary} style={styles.inputIcon} />
        <TextInput
          {...genericInputProps}
          style={styles.input}
          placeholder={copy.titleRequired}
          placeholderTextColor={AppTheme.colors.placeholder}
          value={values.title}
          autoCapitalize="words"
          nativeID="entry-title"
          onFocus={(event) => handleInputFocus(event)}
          onChangeText={(text) => onChange('title', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="bookmark-outline" size={17} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
        <TextInput
          {...genericInputProps}
          style={styles.input}
          placeholder={copy.latestChapterEpisode}
          placeholderTextColor={AppTheme.colors.placeholder}
          value={values.episode}
          nativeID="entry-episode"
          onFocus={(event) => handleInputFocus(event)}
          onChangeText={(text) => onChange('episode', text)}
        />
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.label}>{copy.seriesStatus}</Text>
        <View style={styles.segmentedControl}>
          {statusOptions.map((option) => {
            const isSelected = values.seriesStatus === option.value;
            const iconColor = isSelected
              ? option.value === 'completed'
                ? AppTheme.colors.success
                : option.value === 'discontinued'
                  ? AppTheme.colors.danger
                  : AppTheme.colors.ongoing
              : AppTheme.colors.textMuted;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.segmentedOption,
                  isSelected && styles.segmentedOptionSelected,
                ]}
                onPress={() => onChange('seriesStatus', option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                activeOpacity={0.85}
              >
                <Ionicons name={option.icon} size={15} color={iconColor} />
                <Text
                  style={[
                    styles.segmentedOptionText,
                    isSelected && styles.segmentedOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="open-outline" size={17} color={AppTheme.colors.textMuted} style={styles.inputIcon} />
        <TextInput
          {...urlInputProps}
          style={styles.input}
          placeholder={copy.readingLink}
          placeholderTextColor={AppTheme.colors.placeholder}
          value={values.link}
          nativeID="entry-link"
          returnKeyType="done"
          enterKeyHint="done"
          onFocus={(event) => handleInputFocus(event)}
          onChangeText={(text) => onChange('link', text)}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>{copy.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          onPress={onSubmit}
          disabled={isSaving}
          activeOpacity={0.86}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSaving
              ? copy.saving
              : mode === 'edit'
                ? copy.saveChanges
                : copy.saveEntry}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.xl,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 20,
    marginBottom: 20,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 11,
    color: AppTheme.colors.primary,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginTop: 1,
  },
  headerBubble: {
    backgroundColor: AppTheme.colors.primarySoft,
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBubbleText: {
    color: AppTheme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  imagePanel: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.lg,
    padding: 14,
    marginBottom: 14,
  },
  imagePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  clearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.colors.dangerSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.pill,
  },
  clearInline: {
    fontSize: 11,
    color: AppTheme.colors.danger,
    fontWeight: '700',
  },
  imageSection: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  imagePickerButton: {
    flex: 1,
    minHeight: 110,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },
  imagePickerButtonText: {
    color: AppTheme.colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 13,
  },
  previewImage: {
    width: 90,
    height: 120,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.surface,
  },
  emptyPreview: {
    width: 90,
    height: 120,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  emptyPreviewTitle: {
    fontSize: 10,
    color: AppTheme.colors.textMuted,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  emptyPreviewText: {
    fontSize: 9,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: AppTheme.colors.textPrimary,
    fontWeight: '500',
  },
  statusSection: {
    marginBottom: 14,
    gap: 6,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.pill,
    padding: 4,
  },
  segmentedOption: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: AppTheme.radius.pill,
  },
  segmentedOptionSelected: {
    backgroundColor: AppTheme.colors.surface,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedOptionText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  segmentedOptionTextSelected: {
    color: AppTheme.colors.textPrimary,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  cancelButtonText: {
    color: AppTheme.colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  submitButton: {
    flex: 1.5,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.primary,
    shadowColor: AppTheme.colors.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
