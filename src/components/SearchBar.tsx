import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppTheme } from '../constants/theme';
import { AppLanguage, getCopy } from '../constants/localization';
import {
  ENTRY_SORT_OPTIONS,
  EntrySortOption,
  getSortLabel,
} from '../utils/entries';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  resultCount: number;
  sortOption: EntrySortOption;
  onChangeSort: (value: EntrySortOption) => void;
  language: AppLanguage;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

const DROPDOWN_WIDTH = 190;

export const SearchBar = ({
  value,
  onChangeText,
  resultCount,
  sortOption,
  onChangeSort,
  language,
}: SearchBarProps) => {
  const copy = getCopy(language);
  const triggerRef = useRef<View>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: DROPDOWN_WIDTH,
  });
  const autofillDisabledProps = {
    autoComplete: 'off' as const,
    textContentType: 'none' as const,
    importantForAutofill: 'no' as const,
    autoCorrect: false,
    spellCheck: false,
  };

  const handleToggleDropdown = () => {
    if (isDropdownVisible) {
      setIsDropdownVisible(false);
      return;
    }

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get('window').width;
      const safeLeft = Math.max(
        18,
        Math.min(x + width - DROPDOWN_WIDTH, screenWidth - DROPDOWN_WIDTH - 18)
      );

      setDropdownPosition({
        top: y + height + 8,
        left: safeLeft,
        width: DROPDOWN_WIDTH,
      });
      setIsDropdownVisible(true);
    });
  };

  const handleSelectSort = (nextSort: EntrySortOption) => {
    onChangeSort(nextSort);
    setIsDropdownVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.panel}>
        <View style={styles.searchRow}>
          <View style={styles.searchIconWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
          </View>
          <TextInput
            {...autofillDisabledProps}
            style={styles.input}
            placeholder={copy.searchPlaceholder}
            placeholderTextColor={AppTheme.colors.placeholder}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsDropdownVisible(false)}
          />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.resultChip}>
            <Text style={styles.resultLabel}>{copy.results}</Text>
            <Text style={styles.resultValue}>
              {resultCount} {copy.entries}
            </Text>
          </View>

          <TouchableOpacity
            ref={triggerRef}
            style={styles.sortTrigger}
            onPress={handleToggleDropdown}
            activeOpacity={0.88}
          >
            <Text style={styles.sortTriggerLabel}>{copy.sortBy}</Text>
            <Text style={styles.sortTriggerValue}>
              {getSortLabel(sortOption, language)}
            </Text>
            <Text style={styles.sortTriggerArrow}>
              {isDropdownVisible ? '▴' : '▾'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              },
            ]}
          >
            <Text style={styles.dropdownTitle}>{copy.chooseSorting}</Text>
            {ENTRY_SORT_OPTIONS.map((option) => {
              const isActive = option === sortOption;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    isActive && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleSelectSort(option)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      isActive && styles.dropdownItemTextActive,
                    ]}
                  >
                    {getSortLabel(option, language)}
                  </Text>
                  {isActive ? <Text style={styles.checkmark}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  panel: {
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: '#E6D7C9',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AppTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: AppTheme.colors.textSecondary,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: AppTheme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  resultChip: {
    flex: 1,
    backgroundColor: AppTheme.colors.secondarySoft,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resultLabel: {
    fontSize: 11,
    color: AppTheme.colors.secondary,
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: 0.4,
  },
  resultValue: {
    fontSize: 14,
    color: AppTheme.colors.textPrimary,
    fontWeight: '800',
  },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortTriggerLabel: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
  },
  sortTriggerValue: {
    fontSize: 13,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
  },
  sortTriggerArrow: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 6,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 14,
  },
  dropdownTitle: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
  },
  dropdownItem: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  dropdownItemText: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    color: AppTheme.colors.primaryDark,
    fontWeight: '800',
  },
  checkmark: {
    fontSize: 14,
    color: AppTheme.colors.primaryDark,
    fontWeight: '800',
  },
});
