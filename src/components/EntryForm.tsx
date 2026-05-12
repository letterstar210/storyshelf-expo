import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { AppTheme } from '../constants/theme';
import { AppLanguage, getCopy } from '../constants/localization';

export interface EntryFormValues {
  title: string;
  episode: string;
  link: string;
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
  onSubmit,
  onCancel,
  onPickImage,
  onClearImage,
}: EntryFormProps) => {
  const copy = getCopy(language);
  const previewUri = values.localImageUri || values.coverImage;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.caption}>
            {mode === 'edit' ? copy.editMode : copy.newEntry}
          </Text>
          <Text style={styles.title}>
            {mode === 'edit' ? copy.editComicEntry : copy.addComicEntry}
          </Text>
        </View>
        <View style={styles.headerBubble}>
          <Text style={styles.headerBubbleText}>
            {mode === 'edit' ? copy.update : copy.create}
          </Text>
        </View>
      </View>

      <View style={styles.imagePanel}>
        <View style={styles.imagePanelHeader}>
          <Text style={styles.label}>{copy.coverImage}</Text>
          {previewUri ? (
            <TouchableOpacity onPress={onClearImage}>
              <Text style={styles.clearInline}>{copy.clearImage}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={onPickImage}>
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
              <Text style={styles.emptyPreviewTitle}>{copy.noCoverSelected}</Text>
              <Text style={styles.emptyPreviewText}>
                {copy.noCoverSelectedText}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder={copy.coverUrlOptional}
        placeholderTextColor={AppTheme.colors.placeholder}
        value={values.coverImage}
        autoCapitalize="none"
        onChangeText={(text) => {
          onChange('coverImage', text);

          if (text.trim()) {
            onChange('localImageUri', null);
          }
        }}
      />

      <TextInput
        style={styles.input}
        placeholder={copy.titleRequired}
        placeholderTextColor={AppTheme.colors.placeholder}
        value={values.title}
        onChangeText={(text) => onChange('title', text)}
      />

      <TextInput
        style={styles.input}
        placeholder={copy.latestChapterEpisode}
        placeholderTextColor={AppTheme.colors.placeholder}
        value={values.episode}
        onChangeText={(text) => onChange('episode', text)}
      />

      <TextInput
        style={styles.input}
        placeholder={copy.readingLink}
        placeholderTextColor={AppTheme.colors.placeholder}
        value={values.link}
        autoCapitalize="none"
        keyboardType="url"
        onChangeText={(text) => onChange('link', text)}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{copy.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          onPress={onSubmit}
          disabled={isSaving}
        >
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
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 18,
    marginBottom: 20,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  caption: {
    fontSize: 11,
    color: AppTheme.colors.primaryDark,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
  },
  headerBubble: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerBubbleText: {
    color: AppTheme.colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  imagePanel: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.md,
    padding: 14,
    marginBottom: 14,
  },
  imagePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  clearInline: {
    fontSize: 13,
    color: AppTheme.colors.danger,
    fontWeight: '800',
  },
  imageSection: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  imagePickerButton: {
    flex: 1,
    minHeight: 120,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  imagePickerButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 14,
  },
  previewImage: {
    width: 108,
    height: 148,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  emptyPreview: {
    width: 108,
    height: 148,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  emptyPreviewTitle: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyPreviewText: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: '#E4D4C5',
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 15,
    color: AppTheme.colors.textPrimary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
  },
  cancelButtonText: {
    color: AppTheme.colors.textSecondary,
    fontWeight: '800',
  },
  submitButton: {
    flex: 1.4,
    borderRadius: 16,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D69B7C',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});
