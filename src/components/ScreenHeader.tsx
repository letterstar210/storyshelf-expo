import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppTheme } from '../constants/theme';
import { AppLanguage, getCopy } from '../constants/localization';

interface ScreenHeaderProps {
  title: string;
  totalEntriesText: string;
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
  onToggleForm: () => void;
  onToolsPress: () => void;
}

export const ScreenHeader = ({
  title,
  totalEntriesText,
  language,
  onLanguageChange,
  onToggleForm,
  onToolsPress,
}: ScreenHeaderProps) => {
  const copy = getCopy(language);

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={styles.kicker}>{copy.library}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.languageSwitcher}>
          <TouchableOpacity style={[styles.languageButton, language === 'th' && styles.languageButtonActive]} onPress={() => onLanguageChange('th')}>
            <Text style={[styles.languageText, language === 'th' && styles.languageTextActive]}>{copy.thai}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.languageButton, language === 'en' && styles.languageButtonActive]} onPress={() => onLanguageChange('en')}>
            <Text style={[styles.languageText, language === 'en' && styles.languageTextActive]}>{copy.english}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.totalValue}>{totalEntriesText}</Text>
          <Text style={styles.totalLabel}>{copy.library}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.toolsButton} onPress={onToolsPress} activeOpacity={0.82}>
            <Text style={styles.toolsButtonText}>{copy.libraryTools}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={onToggleForm} activeOpacity={0.82}>
            <Text style={styles.addButtonText}>{copy.addEntry}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { backgroundColor: AppTheme.colors.surface, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.border, marginBottom: 22, paddingBottom: 18 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: AppTheme.colors.border },
  kicker: { color: AppTheme.colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.7, marginBottom: 5 },
  identity: { flex: 1, minWidth: 0 },
  title: { color: AppTheme.colors.textPrimary, fontSize: 26, fontWeight: '700', letterSpacing: -0.7 },
  languageSwitcher: { flexDirection: 'row', flexShrink: 0, borderWidth: 1, borderColor: AppTheme.colors.border },
  languageButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 9 },
  languageButtonActive: { backgroundColor: AppTheme.colors.primary },
  languageText: { color: AppTheme.colors.textSecondary, fontSize: 12, fontWeight: '700' },
  languageTextActive: { color: AppTheme.colors.textOnDark },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, paddingTop: 18 },
  totalValue: { color: AppTheme.colors.textPrimary, fontSize: 28, fontWeight: '700', letterSpacing: -0.8 },
  totalLabel: { color: AppTheme.colors.textMuted, fontSize: 12, marginTop: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 },
  toolsButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: AppTheme.colors.border },
  toolsButtonText: { color: AppTheme.colors.textSecondary, fontSize: 13, fontWeight: '700' },
  addButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, backgroundColor: AppTheme.colors.primary },
  addButtonText: { color: AppTheme.colors.textOnDark, fontSize: 13, fontWeight: '700' },
});
