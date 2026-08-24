import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../constants/theme';
import { AppLanguage, getCopy } from '../constants/localization';

interface ScreenHeaderProps {
  title: string;
  totalEntriesText: string;
  statusCounts: { ongoing: number; completed: number; discontinued: number };
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
  onToggleForm: () => void;
  onToolsPress: () => void;
}

export const ScreenHeader = ({
  title,
  totalEntriesText,
  statusCounts,
  language,
  onLanguageChange,
  onToggleForm,
  onToolsPress,
}: ScreenHeaderProps) => {
  const copy = getCopy(language);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <View style={styles.identityGroup}>
          <View style={styles.iconBadge}>
            <Ionicons name="book" size={20} color={AppTheme.colors.primary} />
          </View>
          <View style={styles.identityText}>
            <Text style={styles.kicker}>{copy.libraryBadge}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        <View style={styles.languageSwitcher}>
          <Ionicons
            name="globe-outline"
            size={15}
            color={AppTheme.colors.textMuted}
            style={styles.globeIcon}
          />
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'th' && styles.languageButtonActive,
            ]}
            onPress={() => onLanguageChange('th')}
            accessibilityRole="button"
            accessibilityState={{ selected: language === 'th' }}
          >
            <Text
              style={[
                styles.languageText,
                language === 'th' && styles.languageTextActive,
              ]}
            >
              {copy.thai}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'en' && styles.languageButtonActive,
            ]}
            onPress={() => onLanguageChange('en')}
            accessibilityRole="button"
            accessibilityState={{ selected: language === 'en' }}
          >
            <Text
              style={[
                styles.languageText,
                language === 'en' && styles.languageTextActive,
              ]}
            >
              {copy.english}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionBanner}>
        <View style={styles.totalBadge}>
          <Ionicons name="layers-outline" size={18} color={AppTheme.colors.primary} />
          <View>
            <Text style={styles.totalValue}>{totalEntriesText}</Text>
            <Text style={styles.totalLabel}>{copy.library}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.toolsButton}
            onPress={onToolsPress}
            activeOpacity={0.82}
            accessibilityRole="button"
          >
            <Ionicons
              name="options-outline"
              size={17}
              color={AppTheme.colors.textPrimary}
            />
            <Text style={styles.toolsButtonText}>{copy.libraryTools}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={onToggleForm}
            activeOpacity={0.86}
            accessibilityRole="button"
          >
            <Ionicons name="add-circle" size={19} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{copy.addEntry}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, styles.metricCardOngoing]}>
          <Ionicons name="play-circle" size={16} color={AppTheme.colors.ongoing} />
          <View style={styles.metricTextWrap}>
            <Text style={[styles.metricValue, { color: AppTheme.colors.ongoing }]}>
              {statusCounts.ongoing}
            </Text>
            <Text style={styles.metricLabel}>{copy.statusOngoing}</Text>
          </View>
        </View>

        <View style={[styles.metricCard, styles.metricCardCompleted]}>
          <Ionicons name="checkmark-circle" size={16} color={AppTheme.colors.success} />
          <View style={styles.metricTextWrap}>
            <Text style={[styles.metricValue, { color: AppTheme.colors.success }]}>
              {statusCounts.completed}
            </Text>
            <Text style={styles.metricLabel}>{copy.statusCompleted}</Text>
          </View>
        </View>

        <View style={[styles.metricCard, styles.metricCardDiscontinued]}>
          <Ionicons name="pause-circle" size={16} color={AppTheme.colors.danger} />
          <View style={styles.metricTextWrap}>
            <Text style={[styles.metricValue, { color: AppTheme.colors.danger }]}>
              {statusCounts.discontinued}
            </Text>
            <Text style={styles.metricLabel}>{copy.statusDiscontinued}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  identityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    flex: 1,
  },
  kicker: {
    color: AppTheme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: AppTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  languageSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.pill,
    padding: 3,
    paddingLeft: 8,
  },
  globeIcon: {
    marginRight: 4,
  },
  languageButton: {
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: AppTheme.radius.pill,
  },
  languageButtonActive: {
    backgroundColor: AppTheme.colors.surface,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  languageText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  languageTextActive: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
  actionBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppTheme.colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: AppTheme.radius.md,
  },
  totalValue: {
    color: AppTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  totalLabel: {
    color: AppTheme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolsButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  toolsButtonText: {
    color: AppTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.primary,
    shadowColor: AppTheme.colors.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  metricCardOngoing: {
    backgroundColor: AppTheme.colors.ongoingSoft,
  },
  metricCardCompleted: {
    backgroundColor: AppTheme.colors.successSoft,
  },
  metricCardDiscontinued: {
    backgroundColor: AppTheme.colors.dangerSoft,
  },
  metricTextWrap: {
    flex: 1,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  metricLabel: {
    color: AppTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
});
