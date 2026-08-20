import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { AppTheme } from '../constants/theme';
import { AppLanguage, getCopy } from '../constants/localization';
import { Entry } from '../types/entry';
import { formatUpdatedAt } from '../utils/entries';

interface EntryCardProps {
  entry: Entry;
  language: AppLanguage;
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: string) => void;
  onOpenLink: (url: string) => void;
}

export const EntryCard = ({
  entry,
  language,
  onEdit,
  onDelete,
  onOpenLink,
}: EntryCardProps) => {
  const copy = getCopy(language);
  const imageUri = entry.localImageUri || entry.coverImage;
  const seriesStatus =
    entry.seriesStatus === 'completed'
      ? copy.statusCompleted
      : entry.seriesStatus === 'discontinued'
        ? copy.statusDiscontinued
        : copy.statusOngoing;

  return (
    <View style={styles.card}>
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
          <TouchableOpacity style={styles.linkButton} onPress={() => onOpenLink(entry.link)}>
            <Text style={styles.linkButtonText}>{copy.openReadingLink}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(entry)}>
            <Text style={styles.editText}>{copy.edit}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(entry.id)}>
            <Text style={styles.deleteText}>{copy.delete}</Text>
          </TouchableOpacity>
        </View>
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
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  coverWrap: {
    width: 86,
  },
  cover: {
    width: 86,
    height: 124,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  placeholderCover: {
    width: 86,
    height: 124,
    borderRadius: 18,
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
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
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
});
