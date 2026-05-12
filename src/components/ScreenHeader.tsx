import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppTheme } from '../constants/theme';
import { AppLanguage, getCopy } from '../constants/localization';

interface ScreenHeaderProps {
  title: string;
  subtitle: string;
  totalEntriesText: string;
  isFormVisible: boolean;
  isImporting: boolean;
  isSyncing: boolean;
  isClearing: boolean;
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
  onToggleForm: () => void;
  onImportPress: () => void;
  onSyncPress: () => void;
  onClearPress: () => void;
}

export const ScreenHeader = ({
  title,
  subtitle,
  totalEntriesText,
  isFormVisible,
  isImporting,
  isSyncing,
  isClearing,
  language,
  onLanguageChange,
  onToggleForm,
  onImportPress,
  onSyncPress,
  onClearPress,
}: ScreenHeaderProps) => {
  const copy = getCopy(language);

  return (
    <View style={styles.wrapper}>
      <View style={styles.glowLarge} />
      <View style={styles.glowSmall} />

      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{copy.libraryBadge}</Text>
        </View>
        <View style={styles.topRight}>
          <View style={styles.languageSwitcher}>
            <Text style={styles.languageLabel}>{copy.languageLabel}</Text>
            <View style={styles.languagePills}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'th' && styles.languageButtonActive,
                ]}
                onPress={() => onLanguageChange('th')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'th' && styles.languageButtonTextActive,
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
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'en' && styles.languageButtonTextActive,
                  ]}
                >
                  {copy.english}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countLabel}>{copy.total}</Text>
            <Text style={styles.countValue}>{totalEntriesText}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCaption}>{copy.headerNoteTitle}</Text>
          <Text style={styles.infoText}>{copy.headerNoteText}</Text>
        </View>

        <View style={styles.buttonColumn}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={onImportPress}
            activeOpacity={0.9}
          >
            <Text style={styles.importButtonText}>
              {isImporting ? copy.importing : copy.importExcel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={onSyncPress}
            activeOpacity={0.9}
          >
            <Text style={styles.syncButtonText}>
              {isSyncing ? copy.syncing : copy.syncOta}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearPress}
            activeOpacity={0.9}
          >
            <Text style={styles.clearButtonText}>
              {isClearing ? copy.clearing : copy.clearLibrary}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isFormVisible && styles.buttonActive]}
            onPress={onToggleForm}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonIcon}>{isFormVisible ? '×' : '+'}</Text>
            <Text style={styles.buttonText}>
              {isFormVisible ? copy.closeForm : copy.addEntry}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: AppTheme.colors.panel,
    borderRadius: AppTheme.radius.xl,
    padding: 22,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 26,
    elevation: 10,
  },
  glowLarge: {
    position: 'absolute',
    top: -30,
    right: -18,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 107, 59, 0.24)',
  },
  glowSmall: {
    position: 'absolute',
    bottom: -24,
    left: -18,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 247, 239, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    gap: 12,
  },
  topRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  badge: {
    backgroundColor: 'rgba(255, 247, 239, 0.12)',
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 247, 239, 0.16)',
  },
  badgeText: {
    color: AppTheme.colors.textOnDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  languageSwitcher: {
    alignItems: 'flex-end',
  },
  languageLabel: {
    color: 'rgba(255, 247, 239, 0.68)',
    fontSize: 11,
    marginBottom: 4,
  },
  languagePills: {
    flexDirection: 'row',
    gap: 6,
  },
  languageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: 'rgba(255, 247, 239, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 247, 239, 0.14)',
  },
  languageButtonActive: {
    backgroundColor: '#FFF7EF',
  },
  languageButtonText: {
    color: AppTheme.colors.textOnDark,
    fontSize: 12,
    fontWeight: '800',
  },
  languageButtonTextActive: {
    color: AppTheme.colors.primaryDark,
  },
  countBadge: {
    alignItems: 'flex-end',
  },
  countLabel: {
    color: 'rgba(255, 247, 239, 0.68)',
    fontSize: 11,
    marginBottom: 2,
  },
  countValue: {
    color: AppTheme.colors.textOnDark,
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    marginBottom: 22,
    maxWidth: '80%',
  },
  title: {
    fontSize: 31,
    fontWeight: '900',
    color: AppTheme.colors.textOnDark,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 247, 239, 0.76)',
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 247, 239, 0.08)',
    borderRadius: AppTheme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 247, 239, 0.1)',
  },
  infoCaption: {
    color: AppTheme.colors.primarySoft,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  infoText: {
    color: AppTheme.colors.textOnDark,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    minWidth: 132,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#9F5A3A',
  },
  buttonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
    marginBottom: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonColumn: {
    gap: 10,
    minWidth: 132,
  },
  importButton: {
    backgroundColor: 'rgba(255, 247, 239, 0.14)',
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 247, 239, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonText: {
    color: AppTheme.colors.textOnDark,
    fontSize: 13,
    fontWeight: '800',
  },
  syncButton: {
    backgroundColor: 'rgba(255, 247, 239, 0.2)',
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 247, 239, 0.24)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: AppTheme.colors.textOnDark,
    fontSize: 13,
    fontWeight: '800',
  },
  clearButton: {
    backgroundColor: 'rgba(248, 221, 218, 0.22)',
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(248, 221, 218, 0.34)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FFE9E6',
    fontSize: 13,
    fontWeight: '800',
  },
});
