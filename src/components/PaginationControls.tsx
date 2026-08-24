import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../constants/theme';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

type PaginationCopy = {
  itemsPerPage: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  pageOf: string;
};

type PageSizeSelectorProps = {
  pageSize: PageSize;
  onPageSizeChange: (pageSize: PageSize) => void;
  copy: Pick<PaginationCopy, 'itemsPerPage'>;
};

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  copy: Omit<PaginationCopy, 'itemsPerPage'>;
};

type PageToken = number | 'leading-ellipsis' | 'trailing-ellipsis';

const getPageTokens = (currentPage: number, totalPages: number): PageToken[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const tokens: PageToken[] = [];

  if (start > 1) {
    tokens.push('leading-ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(page);
  }

  if (end < totalPages) {
    tokens.push('trailing-ellipsis');
  }

  return tokens;
};

const formatPageInfo = (template: string, currentPage: number, totalPages: number) =>
  template
    .replace('{current}', String(currentPage))
    .replace('{total}', String(totalPages));

export function PageSizeSelector({ pageSize, onPageSizeChange, copy }: PageSizeSelectorProps) {
  return (
    <View style={styles.pageSizeCard}>
      <View style={styles.pageSizeTitleRow}>
        <Ionicons name="layers-outline" size={15} color={AppTheme.colors.primary} />
        <Text style={styles.pageSizeLabel}>{copy.itemsPerPage}</Text>
      </View>

      <View style={styles.pageSizeOptions}>
        {PAGE_SIZE_OPTIONS.map((option) => {
          const isSelected = option === pageSize;

          return (
            <Pressable
              key={option}
              style={[styles.pageSizeOption, isSelected && styles.pageSizeOptionSelected]}
              onPress={() => onPageSizeChange(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.pageSizeText, isSelected && styles.pageSizeTextSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  copy,
}: PaginationControlsProps) {
  const pageTokens = useMemo(
    () => getPageTokens(currentPage, totalPages),
    [currentPage, totalPages],
  );
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <View style={styles.paginationCard}>
      <View style={styles.paginationHeader}>
        <Ionicons name="bookmark-outline" size={15} color={AppTheme.colors.primary} />
        <Text style={styles.pageInfo}>{formatPageInfo(copy.pageOf, currentPage, totalPages)}</Text>
      </View>

      <View style={styles.jumpControls}>
        <Pressable
          style={[styles.jumpButton, isFirstPage && styles.controlButtonDisabled]}
          disabled={isFirstPage}
          onPress={() => onPageChange(1)}
          accessibilityRole="button"
          accessibilityLabel={copy.firstPage}
        >
          <Ionicons
            name="play-skip-back-outline"
            size={14}
            color={isFirstPage ? AppTheme.colors.textMuted : AppTheme.colors.primary}
          />
        </Pressable>
        <Pressable
          style={[styles.jumpButton, isFirstPage && styles.controlButtonDisabled]}
          disabled={isFirstPage}
          onPress={() => onPageChange(currentPage - 1)}
          accessibilityRole="button"
          accessibilityLabel={copy.previousPage}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={isFirstPage ? AppTheme.colors.textMuted : AppTheme.colors.primary}
          />
        </Pressable>
        <View style={styles.jumpDivider} />
        <Pressable
          style={[styles.jumpButton, isLastPage && styles.controlButtonDisabled]}
          disabled={isLastPage}
          onPress={() => onPageChange(currentPage + 1)}
          accessibilityRole="button"
          accessibilityLabel={copy.nextPage}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isLastPage ? AppTheme.colors.textMuted : AppTheme.colors.primary}
          />
        </Pressable>
        <Pressable
          style={[styles.jumpButton, isLastPage && styles.controlButtonDisabled]}
          disabled={isLastPage}
          onPress={() => onPageChange(totalPages)}
          accessibilityRole="button"
          accessibilityLabel={copy.lastPage}
        >
          <Ionicons
            name="play-skip-forward-outline"
            size={14}
            color={isLastPage ? AppTheme.colors.textMuted : AppTheme.colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.pageNumberRow}>
        {pageTokens.map((token) => {
          if (typeof token !== 'number') {
            return <Text key={token} style={styles.ellipsis}>...</Text>;
          }

          const isCurrentPage = token === currentPage;

          return (
            <Pressable
              key={token}
              style={[styles.pageButton, isCurrentPage && styles.pageButtonSelected]}
              onPress={() => onPageChange(token)}
              accessibilityRole="button"
              accessibilityState={{ selected: isCurrentPage }}
            >
              <Text style={[styles.pageButtonText, isCurrentPage && styles.pageButtonTextSelected]}>
                {token}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageSizeCard: {
    marginTop: AppTheme.spacing.md,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
    padding: AppTheme.spacing.sm,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  pageSizeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.xs,
    marginBottom: AppTheme.spacing.sm,
  },
  pageSizeLabel: {
    color: AppTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  pageSizeOptions: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surfaceMuted,
    padding: 3,
  },
  pageSizeOption: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppTheme.radius.pill,
  },
  pageSizeOptionSelected: {
    backgroundColor: AppTheme.colors.surface,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  pageSizeText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  pageSizeTextSelected: {
    color: AppTheme.colors.primary,
    fontWeight: '800',
  },
  paginationCard: {
    marginTop: AppTheme.spacing.lg,
    gap: AppTheme.spacing.md,
    alignItems: 'center',
    borderRadius: AppTheme.radius.xl,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
    padding: AppTheme.spacing.md,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  paginationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.xs,
  },
  pageInfo: {
    color: AppTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  jumpControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 3,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  jumpButton: {
    minWidth: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surface,
  },
  jumpDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 2,
    backgroundColor: AppTheme.colors.border,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  pageNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surfaceMuted,
    paddingHorizontal: 8,
  },
  pageButtonSelected: {
    backgroundColor: AppTheme.colors.primary,
    shadowColor: AppTheme.colors.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  pageButtonText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  pageButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ellipsis: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 2,
  },
});
