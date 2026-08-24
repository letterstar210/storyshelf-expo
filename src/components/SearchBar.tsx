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
import { Ionicons } from '@expo/vector-icons';
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

const DROPDOWN_WIDTH = 210;

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
        16,
        Math.min(x + width - DROPDOWN_WIDTH, screenWidth - DROPDOWN_WIDTH - 16)
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
          <Ionicons
            name="search-outline"
            size={19}
            color={AppTheme.colors.primary}
            style={styles.searchIcon}
          />
          <TextInput
            {...autofillDisabledProps}
            style={styles.input}
            placeholder={copy.searchPlaceholder}
            placeholderTextColor={AppTheme.colors.placeholder}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsDropdownVisible(false)}
          />
          {value ? (
            <TouchableOpacity
              onPress={() => onChangeText('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={AppTheme.colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.resultChip}>
            <Ionicons
              name="funnel-outline"
              size={14}
              color={AppTheme.colors.secondary}
            />
            <Text style={styles.resultLabel}>{copy.results}:</Text>
            <Text style={styles.resultValue}>
              {resultCount} {copy.entries}
            </Text>
          </View>

          <TouchableOpacity
            ref={triggerRef}
            style={styles.sortTrigger}
            onPress={handleToggleDropdown}
            activeOpacity={0.82}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={15}
              color={AppTheme.colors.primary}
            />
            <Text style={styles.sortTriggerLabel}>{copy.sortBy}:</Text>
            <Text style={styles.sortTriggerValue}>
              {getSortLabel(sortOption, language)}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={AppTheme.colors.textMuted}
            />
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
            <View style={styles.dropdownHeader}>
              <Ionicons
                name="swap-vertical"
                size={14}
                color={AppTheme.colors.primary}
              />
              <Text style={styles.dropdownTitle}>{copy.chooseSorting}</Text>
            </View>
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
                  {isActive ? (
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color={AppTheme.colors.primary}
                    />
                  ) : null}
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
    marginBottom: 16,
  },
  panel: {
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 14,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
    color: AppTheme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  resultChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.colors.secondarySoft,
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: AppTheme.colors.secondary,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 13,
    color: AppTheme.colors.textPrimary,
    fontWeight: '800',
  },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  sortTriggerLabel: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    fontWeight: '600',
  },
  sortTriggerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 8,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
    marginBottom: 4,
  },
  dropdownTitle: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    fontWeight: '700',
  },
  dropdownItem: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: AppTheme.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: AppTheme.colors.primarySoft,
  },
  dropdownItemText: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
});
