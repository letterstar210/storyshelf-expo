import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
        <View style={styles.pageSizeAccent} />
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
        <View style={styles.paginationAccent} />
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
          <Text style={styles.controlText}>{'<<'}</Text>
        </Pressable>
        <Pressable
          style={[styles.jumpButton, isFirstPage && styles.controlButtonDisabled]}
          disabled={isFirstPage}
          onPress={() => onPageChange(currentPage - 1)}
          accessibilityRole="button"
          accessibilityLabel={copy.previousPage}
        >
          <Text style={styles.controlText}>{'<'}</Text>
        </Pressable>
        <View style={styles.jumpDivider} />
        <Pressable
          style={[styles.jumpButton, isLastPage && styles.controlButtonDisabled]}
          disabled={isLastPage}
          onPress={() => onPageChange(currentPage + 1)}
          accessibilityRole="button"
          accessibilityLabel={copy.nextPage}
        >
          <Text style={styles.controlText}>{'>'}</Text>
        </Pressable>
        <Pressable
          style={[styles.jumpButton, isLastPage && styles.controlButtonDisabled]}
          disabled={isLastPage}
          onPress={() => onPageChange(totalPages)}
          accessibilityRole="button"
          accessibilityLabel={copy.lastPage}
        >
          <Text style={styles.controlText}>{'>>'}</Text>
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
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surfaceRaised,
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
  pageSizeAccent: {
    width: 7,
    height: 7,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.primary,
  },
  pageSizeLabel: {
    color: AppTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  pageSizeOptions: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: AppTheme.radius.sm,
    backgroundColor: AppTheme.colors.surfaceMuted,
    padding: 4,
  },
  pageSizeOption: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppTheme.radius.sm,
  },
  pageSizeOptionSelected: {
    backgroundColor: AppTheme.colors.secondary,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  pageSizeText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  pageSizeTextSelected: {
    color: AppTheme.colors.textOnDark,
  },
  paginationCard: {
    marginTop: AppTheme.spacing.lg,
    gap: AppTheme.spacing.md,
    alignItems: 'center',
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surfaceRaised,
    padding: AppTheme.spacing.sm,
    paddingTop: AppTheme.spacing.md,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  paginationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppTheme.spacing.xs,
  },
  paginationAccent: {
    width: 7,
    height: 7,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.primary,
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
    padding: 4,
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  jumpButton: {
    minWidth: 42,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surfaceRaised,
  },
  jumpDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 2,
    backgroundColor: AppTheme.colors.border,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  controlText: {
    color: AppTheme.colors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  pageNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AppTheme.radius.pill,
    backgroundColor: AppTheme.colors.surfaceMuted,
    paddingHorizontal: 7,
  },
  pageButtonSelected: {
    backgroundColor: AppTheme.colors.primary,
    shadowColor: AppTheme.colors.shadow,
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },
  pageButtonText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  pageButtonTextSelected: {
    color: AppTheme.colors.textOnDark,
  },
  ellipsis: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 1,
  },
});
