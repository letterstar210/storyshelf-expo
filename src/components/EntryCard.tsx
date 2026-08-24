import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
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

  const isCompleted = entry.seriesStatus === 'completed';
  const isDiscontinued = entry.seriesStatus === 'discontinued';
  const seriesStatus = isCompleted
    ? copy.statusCompleted
    : isDiscontinued
      ? copy.statusDiscontinued
      : copy.statusOngoing;

  const statusColor = isCompleted
    ? AppTheme.colors.success
    : isDiscontinued
      ? AppTheme.colors.danger
      : AppTheme.colors.ongoing;

  const statusBg = isCompleted
    ? AppTheme.colors.successSoft
    : isDiscontinued
      ? AppTheme.colors.dangerSoft
      : AppTheme.colors.ongoingSoft;

  const statusIcon = isCompleted
    ? 'checkmark-circle'
    : isDiscontinued
      ? 'pause-circle'
      : 'play-circle';

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
      <View style={styles.topHeaderRow}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>#{String(editorialIndex).padStart(2, '0')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Ionicons name={statusIcon} size={13} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>{seriesStatus}</Text>
        </View>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.coverWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={styles.placeholderCover}>
              <Ionicons name="book-outline" size={26} color={AppTheme.colors.primary} />
              <Text style={styles.placeholderTitle}>{copy.coverMissingTitle}</Text>
              <Text style={styles.placeholderSubtitle}>{copy.coverMissingSubtitle}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {entry.title}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoChip}>
              <Ionicons name="bookmark-outline" size={13} color={AppTheme.colors.primary} />
              <Text style={styles.infoLabel}>{copy.latestChapter}:</Text>
              <Text style={styles.infoValue}>
                {entry.episode ? entry.episode : copy.notSet}
              </Text>
            </View>

            <View style={styles.infoChip}>
              <Ionicons name="time-outline" size={13} color={AppTheme.colors.textMuted} />
              <Text style={styles.infoValueMuted}>
                {formatUpdatedAt(entry.updatedAt, language)}
              </Text>
            </View>
          </View>

          {entry.link ? (
            <View style={styles.linkContainer}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => onOpenLink(entry.link)}
                activeOpacity={0.82}
              >
                <Ionicons name="open-outline" size={14} color={AppTheme.colors.secondary} />
                <Text style={styles.linkButtonText}>{copy.openReadingLink}</Text>
              </TouchableOpacity>

              {entry.linkCheck ? (
                <View style={styles.linkCheckRow}>
                  <View style={styles.linkCheckBadge}>
                    <Ionicons
                      name={
                        entry.linkCheck.status === 'update-available'
                          ? 'sparkles'
                          : entry.linkCheck.status === 'broken'
                            ? 'alert-circle'
                            : 'checkmark-circle'
                      }
                      size={13}
                      color={
                        entry.linkCheck.status === 'update-available'
                          ? AppTheme.colors.primary
                          : entry.linkCheck.status === 'broken'
                            ? AppTheme.colors.danger
                            : AppTheme.colors.success
                      }
                    />
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
                  </View>

                  {entry.linkCheck?.latestEpisode ? (
                    <Text style={styles.linkCheckDetail}>
                      {copy.linkCheckLatest}: {entry.linkCheck.latestEpisode}
                      {entry.linkCheck.updateCount
                        ? ` (+${entry.linkCheck.updateCount})`
                        : ''}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          {isDesktop ? (
            <View style={styles.desktopActions}>
              {entry.link ? (
                <TouchableOpacity
                  style={styles.actionIconButton}
                  onPress={() => onCheckLink(entry)}
                  disabled={isCheckingLink}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color={AppTheme.colors.secondary}
                  />
                  <Text style={styles.actionIconButtonText}>
                    {isCheckingLink ? copy.linkChecking : copy.checkLink}
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={styles.actionIconButton}
                onPress={() => onEdit(entry)}
                accessibilityRole="button"
              >
                <Ionicons name="pencil-outline" size={16} color={AppTheme.colors.primary} />
                <Text style={styles.editText}>{copy.edit}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionIconButton, styles.deleteIconButton]}
                onPress={() => onDelete(entry.id)}
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={16} color={AppTheme.colors.danger} />
                <Text style={styles.deleteText}>{copy.delete}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.mobileActionsTrigger}
              onPress={() => setIsActionsVisible(true)}
              accessibilityRole="button"
              activeOpacity={0.8}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={AppTheme.colors.primary}
              />
              <Text style={styles.mobileActionsTriggerText}>{copy.actions}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={isActionsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsActionsVisible(false)}
      >
        <Pressable style={styles.actionsOverlay} onPress={() => setIsActionsVisible(false)}>
          <Pressable style={styles.actionsSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{entry.title}</Text>

            {entry.link ? (
              <TouchableOpacity
                style={styles.sheetAction}
                onPress={() => {
                  setIsActionsVisible(false);
                  onCheckLink(entry);
                }}
              >
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color={AppTheme.colors.secondary}
                />
                <Text style={styles.sheetActionText}>{copy.checkLink}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                setIsActionsVisible(false);
                onEdit(entry);
              }}
            >
              <Ionicons name="pencil-outline" size={19} color={AppTheme.colors.primary} />
              <Text style={styles.sheetActionText}>{copy.edit}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetAction, styles.sheetDeleteAction]}
              onPress={() => {
                setIsActionsVisible(false);
                onDelete(entry.id);
              }}
            >
              <Ionicons name="trash-outline" size={19} color={AppTheme.colors.danger} />
              <Text style={styles.sheetDeleteText}>{copy.delete}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelButton}
              onPress={() => setIsActionsVisible(false)}
            >
              <Text style={styles.sheetCancelText}>{copy.cancel}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  indexBadge: {
    backgroundColor: AppTheme.colors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: AppTheme.radius.pill,
  },
  indexText: {
    color: AppTheme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.pill,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 14,
  },
  coverWrap: {
    width: 68,
  },
  cover: {
    width: 68,
    height: 94,
    borderRadius: AppTheme.radius.sm,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  placeholderCover: {
    width: 68,
    height: 94,
    borderRadius: AppTheme.radius.sm,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  placeholderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: AppTheme.colors.primary,
    marginTop: 4,
  },
  placeholderSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: AppTheme.colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    lineHeight: 21,
    marginBottom: 6,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AppTheme.colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.xs,
  },
  infoLabel: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    color: AppTheme.colors.textPrimary,
    fontWeight: '700',
  },
  infoValueMuted: {
    fontSize: 11,
    color: AppTheme.colors.textSecondary,
    fontWeight: '600',
  },
  linkContainer: {
    marginBottom: 8,
    gap: 4,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: AppTheme.colors.secondarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.pill,
  },
  linkButtonText: {
    fontSize: 12,
    color: AppTheme.colors.secondary,
    fontWeight: '700',
  },
  linkCheckRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  linkCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  linkCheckStatus: {
    color: AppTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  linkCheckStatusUpdate: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
  linkCheckStatusError: {
    color: AppTheme.colors.danger,
  },
  linkCheckDetail: {
    color: AppTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  desktopActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AppTheme.colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.pill,
  },
  deleteIconButton: {
    backgroundColor: AppTheme.colors.dangerSoft,
  },
  actionIconButtonText: {
    color: AppTheme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  editText: {
    color: AppTheme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  deleteText: {
    color: AppTheme.colors.danger,
    fontWeight: '700',
    fontSize: 12,
  },
  mobileActionsTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: AppTheme.colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.pill,
    marginTop: 2,
  },
  mobileActionsTriggerText: {
    color: AppTheme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  actionsOverlay: {
    flex: 1,
    backgroundColor: AppTheme.colors.overlay,
    justifyContent: 'flex-end',
  },
  actionsSheet: {
    backgroundColor: AppTheme.colors.surface,
    borderTopLeftRadius: AppTheme.radius.xl,
    borderTopRightRadius: AppTheme.radius.xl,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
    gap: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppTheme.colors.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  sheetAction: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 16,
  },
  sheetDeleteAction: {
    backgroundColor: AppTheme.colors.dangerSoft,
  },
  sheetActionText: {
    color: AppTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  sheetDeleteText: {
    color: AppTheme.colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  sheetCancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  sheetCancelText: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
