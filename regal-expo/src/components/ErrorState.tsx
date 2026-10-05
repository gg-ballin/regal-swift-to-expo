import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/theme';

import { PrimaryButton } from './PrimaryButton';

type Props = {
  message: string;
  onRetry: () => void;
};

// SWIFT: MovieDetailViewController.makeErrorView(): centered UIStackView(UILabel, filled "Retry" UIButton) as collectionView.backgroundView.
export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton title="Retry" onPress={onRetry} shape="rounded" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
