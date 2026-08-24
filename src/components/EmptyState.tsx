import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppTheme } from '../constants/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onActionPress: () => void;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity style={styles.button} onPress={onActionPress}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: AppTheme.colors.surfaceRaised,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: 42,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: AppTheme.colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    maxWidth: 260,
  },
  button: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: AppTheme.radius.pill,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
