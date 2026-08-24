import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { AppTheme } from '../constants/theme';
import { AppLanguage, getCopy } from '../constants/localization';
import { Entry } from '../types/entry';
import { formatUpdatedAt } from '../utils/entries';

interface EntryCardProps {
  entry: Entry;
  editorialIndex: number;
  language: AppLanguage;
  isCheckingLink: boolean;
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: string) => void;
  onOpenLink: (url: string) => void;
  onCheckLink: (entry: Entry) => void;
}

export const EntryCard = ({
  entry,
  editorialIndex,
  language,
  isCheckingLink,
  onEdit,
  onDelete,
  onOpenLink,
  onCheckLink,
}: EntryCardProps) => {
  const copy = getCopy(language);
  const { width } = useWindowDimensions();
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const isDesktop = width >= 720;
  const imageUri = entry.localImageUri || entry.coverImage;
  const seriesStatus =
    entry.seriesStatus === 'completed'
      ? copy.statusCompleted
      : entry.seriesStatus === 'discontinued'
        ? copy.statusDiscontinued
        : copy.statusOngoing;
  const linkCheckLabel =
    entry.linkCheck?.status === 'update-available'
      ? copy.linkCheckUpdateAvailable
      : entry.linkCheck?.status === 'up-to-date'
        ? copy.linkCheckUpToDate
        : entry.linkCheck?.status === 'broken'
          ? copy.linkCheckBroken
          : entry.linkCheck?.status === 'check-failed'
            ? copy.linkCheckFailed
            : copy.linkCheckNotChecked;

  return (
    <View style={styles.card}>
      <Text style={styles.index}>{String(editorialIndex).padStart(2, '0')}</Text>
      <View style={styles.coverWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderTitle}>{copy.coverMissingTitle}</Text>
            <Text style={styles.placeholderSubtitle}>
              {copy.coverMissingSubtitle}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {entry.title}
          </Text>
          <View style={styles.updatedBadge}>
            <Text style={styles.updatedBadgeText}>
              {formatUpdatedAt(entry.updatedAt, language)}
            </Text>
          </View>
        </View>

        <View style={styles.infoStrip}>
          <View style={styles.infoPill}>
            <Text style={styles.infoLabel}>{copy.latestChapter}</Text>
            <Text style={styles.infoValue}>
              {entry.episode ? entry.episode : copy.notSet}
            </Text>
          </View>
          <View style={[styles.infoPill, styles.infoPillAlt]}>
            <Text style={styles.infoLabel}>{copy.seriesStatus}</Text>
            <Text style={styles.infoValue}>{seriesStatus}</Text>
          </View>
        </View>

        {entry.link ? (
          <>
            <TouchableOpacity style={styles.linkButton} onPress={() => onOpenLink(entry.link)}>
              <Text style={styles.linkButtonText}>{copy.openReadingLink}</Text>
            </TouchableOpacity>

            <View style={styles.linkCheckRow}>
              <View style={styles.linkCheckTextWrap}>
                <Text
                  style={[
                    styles.linkCheckStatus,
                    entry.linkCheck?.status === 'update-available' &&
                      styles.linkCheckStatusUpdate,
                    entry.linkCheck?.status === 'broken' && styles.linkCheckStatusError,
                  ]}
                >
                  {linkCheckLabel}
                </Text>
                {entry.linkCheck?.latestEpisode ? (
                  <Text style={styles.linkCheckDetail}>
                    {copy.linkCheckLatest}: {entry.linkCheck.latestEpisode}
                    {entry.linkCheck.updateCount
                      ? ` (+${entry.linkCheck.updateCount})`
                      : ''}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.checkLinkButton}
                onPress={() => onCheckLink(entry)}
                disabled={isCheckingLink}
                activeOpacity={0.84}
              >
                <Text style={styles.checkLinkButtonText}>
                  {isCheckingLink ? copy.linkChecking : copy.checkLink}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {isDesktop ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.editButton} onPress={() => onEdit(entry)}><Text style={styles.editText}>{copy.edit}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(entry.id)}><Text style={styles.deleteText}>{copy.delete}</Text></TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.actionsTrigger} onPress={() => setIsActionsVisible(true)}><Text style={styles.actionsTriggerText}>{copy.actions}</Text></TouchableOpacity>
        )}
      </View>

      <Modal visible={isActionsVisible} transparent animationType="fade" onRequestClose={() => setIsActionsVisible(false)}>
        <Pressable style={styles.actionsOverlay} onPress={() => setIsActionsVisible(false)}>
          <Pressable style={styles.actionsPopup}>
            {entry.link ? <TouchableOpacity style={styles.popupAction} onPress={() => { setIsActionsVisible(false); onCheckLink(entry); }}><Text style={styles.popupActionText}>{copy.checkLink}</Text></TouchableOpacity> : null}
            <TouchableOpacity style={styles.popupAction} onPress={() => { setIsActionsVisible(false); onEdit(entry); }}><Text style={styles.popupActionText}>{copy.edit}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.popupAction} onPress={() => { setIsActionsVisible(false); onDelete(entry.id); }}><Text style={styles.popupDeleteText}>{copy.delete}</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 14,
  },
  index: {
    width: 30,
    color: AppTheme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  coverWrap: {
    width: 58,
  },
  cover: {
    width: 58,
    height: 82,
    borderRadius: 0,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  placeholderCover: {
    width: 58,
    height: 82,
    borderRadius: 0,
    backgroundColor: AppTheme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: AppTheme.colors.textMuted,
  },
  placeholderSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: AppTheme.colors.textMuted,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    lineHeight: 23,
  },
  updatedBadge: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  updatedBadgeText: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    fontWeight: '700',
  },
  infoStrip: {
    gap: 8,
    marginBottom: 12,
  },
  infoPill: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  infoPillAlt: {
    backgroundColor: AppTheme.colors.secondarySoft,
  },
  infoLabel: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    fontWeight: '800',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: AppTheme.colors.textPrimary,
    fontWeight: '800',
  },
  linkButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCE6D3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  linkButtonText: {
    fontSize: 13,
    color: AppTheme.colors.primaryDark,
    fontWeight: '800',
  },
  linkCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  linkCheckTextWrap: {
    flex: 1,
  },
  linkCheckStatus: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  linkCheckStatusUpdate: {
    color: AppTheme.colors.success,
  },
  linkCheckStatusError: {
    color: AppTheme.colors.danger,
  },
  linkCheckDetail: {
    color: AppTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  checkLinkButton: {
    backgroundColor: AppTheme.colors.secondarySoft,
    borderRadius: AppTheme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  checkLinkButtonText: {
    color: AppTheme.colors.secondary,
    fontSize: 12,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsTrigger: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center', borderTopWidth: 1, borderTopColor: AppTheme.colors.border, paddingRight: 12 },
  actionsTriggerText: { color: AppTheme.colors.primary, fontSize: 13, fontWeight: '700' },
  editButton: {
    flex: 1,
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 14,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F8DDDA',
    borderRadius: 14,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: AppTheme.colors.danger,
    fontWeight: '800',
    fontSize: 13,
  },
  actionsOverlay: { flex: 1, backgroundColor: AppTheme.colors.overlay, justifyContent: 'flex-end' },
  actionsPopup: { backgroundColor: AppTheme.colors.surfaceRaised, borderTopWidth: 1, borderTopColor: AppTheme.colors.border, paddingHorizontal: 20, paddingVertical: 10 },
  popupAction: { minHeight: 48, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: AppTheme.colors.border },
  popupActionText: { color: AppTheme.colors.textPrimary, fontSize: 15, fontWeight: '700' },
  popupDeleteText: { color: AppTheme.colors.danger, fontSize: 15, fontWeight: '700' },
});
