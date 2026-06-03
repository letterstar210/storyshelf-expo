import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  const formRef = useRef<View | null>(null);
  const [activeLinkField, setActiveLinkField] = useState<'coverImage' | 'link' | null>(null);
  const [linkDraftValue, setLinkDraftValue] = useState('');
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
    returnKeyType: 'done' as const,
    enterKeyHint: 'done' as const,
  };
  const optionalLinkCount =
    Number(Boolean(values.coverImage.trim())) + Number(Boolean(values.link.trim()));
  const optionalLinksLabel =
    language === 'th' ? 'ตัวเลือกเพิ่มเติม' : 'Optional links';
  const showOptionalLinksLabel =
    language === 'th' ? 'แสดงช่องลิงก์เพิ่มเติม' : 'Show optional links';
  const hideOptionalLinksLabel =
    language === 'th' ? 'ซ่อนช่องลิงก์เพิ่มเติม' : 'Hide optional links';
  const savedOptionalLinksLabel =
    language === 'th'
      ? `บันทึกลิงก์เพิ่มเติมไว้ ${optionalLinkCount} รายการ`
      : `Saved optional links: ${optionalLinkCount}`;
  const emptyCoverLabelText =
    language === 'th'
      ? 'เลือกรูปก่อน หรือเปิดตัวเลือกเพิ่มเติมเพื่อวางลิงก์รูปปก'
      : 'Choose an image first, or open optional links to paste a cover URL.';
  const coverLinkLabel =
    language === 'th' ? 'ลิงก์รูปปก (ถ้ามี)' : 'Cover URL (optional)';
  const readingLinkLabel =
    language === 'th' ? 'ลิงก์สำหรับอ่าน' : 'Reading link';
  const addCoverLinkLabel =
    language === 'th' ? 'เพิ่มลิงก์รูปปก' : 'Add cover link';
  const addReadingLinkLabel =
    language === 'th' ? 'เพิ่มลิงก์สำหรับอ่าน' : 'Add reading link';
  const editLinkLabel =
    language === 'th' ? 'แก้ไขลิงก์' : 'Edit link';
  const clearLinkLabel =
    language === 'th' ? 'ล้างลิงก์' : 'Clear link';
  const saveLinkLabel =
    language === 'th' ? 'บันทึกลิงก์' : 'Save link';
  const linkEditorTitle =
    activeLinkField === 'coverImage' ? coverLinkLabel : readingLinkLabel;

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

  const openLinkEditor = (field: 'coverImage' | 'link') => {
    setLinkDraftValue(field === 'coverImage' ? values.coverImage : values.link);
    setActiveLinkField(field);
  };

  const closeLinkEditor = () => {
    setActiveLinkField(null);
    setLinkDraftValue('');
  };

  const saveLinkEditor = () => {
    if (!activeLinkField) {
      return;
    }

    onChange(activeLinkField, linkDraftValue);

    if (activeLinkField === 'coverImage' && linkDraftValue.trim()) {
      onChange('localImageUri', null);
    }

    closeLinkEditor();
  };

  const clearLinkValue = (field: 'coverImage' | 'link') => {
    onChange(field, '');
  };

  return (
    <View ref={formRef} style={styles.card}>
      <Modal
        visible={activeLinkField !== null}
        transparent
        animationType="fade"
        onRequestClose={closeLinkEditor}
      >
        <KeyboardAvoidingView
          style={styles.linkEditorOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.linkEditorBackdrop} onPress={closeLinkEditor}>
            <Pressable style={styles.linkEditorCard}>
              <Text style={styles.linkEditorTitle}>{linkEditorTitle}</Text>
              <TextInput
                {...urlInputProps}
                style={styles.linkEditorInput}
                placeholder={linkEditorTitle}
                placeholderTextColor={AppTheme.colors.placeholder}
                value={linkDraftValue}
                autoCapitalize="none"
                nativeID={
                  activeLinkField === 'coverImage'
                    ? 'entry-cover-url-editor'
                    : 'entry-reading-link-editor'
                }
                onChangeText={setLinkDraftValue}
              />

              <View style={styles.linkEditorFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeLinkEditor}
                >
                  <Text style={styles.cancelButtonText}>{copy.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={saveLinkEditor}
                >
                  <Text style={styles.submitButtonText}>{saveLinkLabel}</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

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
              <Text style={styles.emptyPreviewText}>{emptyCoverLabelText}</Text>
            </View>
          )}
        </View>
      </View>

      <TextInput
        {...genericInputProps}
        style={styles.input}
        placeholder={copy.titleRequired}
        placeholderTextColor={AppTheme.colors.placeholder}
        value={values.title}
        autoCapitalize="words"
        nativeID="entry-title"
        onChangeText={(text) => onChange('title', text)}
      />

      <TextInput
        {...genericInputProps}
        style={styles.input}
        placeholder={copy.latestChapterEpisode}
        placeholderTextColor={AppTheme.colors.placeholder}
        value={values.episode}
        nativeID="entry-episode"
        onChangeText={(text) => onChange('episode', text)}
      />

      <View style={styles.optionalLinksPanel}>
        <View style={styles.optionalLinksHeader}>
          <View>
            <Text style={styles.optionalLinksTitle}>{optionalLinksLabel}</Text>
            {optionalLinkCount > 0 ? (
              <Text style={styles.optionalLinksNote}>
                {savedOptionalLinksLabel}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.optionalLinkRow}>
          <View style={styles.optionalLinkBody}>
            <Text style={styles.optionalLinkLabel}>{coverLinkLabel}</Text>
            <Text style={styles.optionalLinkValue} numberOfLines={1}>
              {values.coverImage.trim() || addCoverLinkLabel}
            </Text>
          </View>
          <View style={styles.optionalLinkActions}>
            <TouchableOpacity
              style={styles.optionalLinksToggle}
              onPress={() => openLinkEditor('coverImage')}
            >
              <Text style={styles.optionalLinksToggleText}>
                {values.coverImage.trim() ? editLinkLabel : addCoverLinkLabel}
              </Text>
            </TouchableOpacity>
            {values.coverImage.trim() ? (
              <TouchableOpacity
                style={styles.optionalLinkClearButton}
                onPress={() => clearLinkValue('coverImage')}
              >
                <Text style={styles.optionalLinkClearText}>{clearLinkLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.optionalLinkDivider} />

        <View style={styles.optionalLinkRow}>
          <View style={styles.optionalLinkBody}>
            <Text style={styles.optionalLinkLabel}>{readingLinkLabel}</Text>
            <Text style={styles.optionalLinkValue} numberOfLines={1}>
              {values.link.trim() || addReadingLinkLabel}
            </Text>
          </View>
          <View style={styles.optionalLinkActions}>
            <TouchableOpacity
              style={styles.optionalLinksToggle}
              onPress={() => openLinkEditor('link')}
            >
              <Text style={styles.optionalLinksToggleText}>
                {values.link.trim() ? editLinkLabel : addReadingLinkLabel}
              </Text>
            </TouchableOpacity>
            {values.link.trim() ? (
              <TouchableOpacity
                style={styles.optionalLinkClearButton}
                onPress={() => clearLinkValue('link')}
              >
                <Text style={styles.optionalLinkClearText}>{clearLinkLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

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
  optionalLinksPanel: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: '#E4D4C5',
    padding: 14,
    marginBottom: 12,
  },
  optionalLinksHeader: {
    marginBottom: 10,
  },
  optionalLinksTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  optionalLinksNote: {
    marginTop: 4,
    fontSize: 12,
    color: AppTheme.colors.textMuted,
  },
  optionalLinksToggle: {
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  optionalLinksToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: AppTheme.colors.primaryDark,
    textAlign: 'center',
  },
  optionalLinkRow: {
    gap: 10,
  },
  optionalLinkBody: {
    gap: 4,
  },
  optionalLinkLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  optionalLinkValue: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
  },
  optionalLinkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionalLinkClearButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  optionalLinkClearText: {
    fontSize: 12,
    fontWeight: '800',
    color: AppTheme.colors.danger,
  },
  optionalLinkDivider: {
    height: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: 12,
  },
  linkEditorOverlay: {
    flex: 1,
  },
  linkEditorBackdrop: {
    flex: 1,
    backgroundColor: AppTheme.colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'android' ? 24 : 18,
  },
  linkEditorCard: {
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 18,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 8,
  },
  linkEditorTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    marginBottom: 12,
  },
  linkEditorInput: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: '#E4D4C5',
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 15,
    color: AppTheme.colors.textPrimary,
    marginBottom: 14,
  },
  linkEditorFooter: {
    flexDirection: 'row',
    gap: 10,
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
