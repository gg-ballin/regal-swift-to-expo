import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { colors, radius, spacing, typography } from '@/theme';

// Same file as the app icon (app.json "icon") and as regal-expo's icon — do not substitute a symbol here.
const appIcon = require('../../assets/icon.png');

/** Regal wordmark for navigation headers. Colors come from tokens. */
export function RegalBrand() {
  return (
    <View style={styles.row} accessibilityRole="header">
      <Image source={appIcon} style={styles.mark} accessibilityLabel="Regal" />
      <View>
        <Text style={styles.wordmark}>REGAL</Text>
        <Text style={styles.sub}>CINEMAS · CROWN CLUB</Text>
      </View>
    </View>
  );
}

/** Shared header styling for Stack + Tabs. */
export const regalHeaderOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: false,
  headerTitle: () => <RegalBrand />,
  headerTitleAlign: 'left' as const,
  contentStyle: { backgroundColor: colors.background },
};

/** Native-stack back control (chevron + “Back”) in Regal orange. */
export function RegalHeaderBack() {
  const onPress = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return (
    <Pressable
      onPress={onPress}
      style={backStyles.row}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <Icon
        name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
        size={22}
        color={colors.primary}
        weight="semibold"
      />
      <Text style={backStyles.label}>Back</Text>
    </Pressable>
  );
}

/** Movie detail stack screen — custom back replaces default “(tabs)” label. */
export const movieDetailHeaderOptions = {
  ...regalHeaderOptions,
  title: 'Movie',
  headerBackTitle: 'Back',
  headerTintColor: colors.primary,
  headerLeft: () => <RegalHeaderBack />,
};

const backStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    marginLeft: -spacing.xs,
  },
  label: { ...typography.body, color: colors.primary, fontSize: 17, fontWeight: '400' },
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mark: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.background },
  wordmark: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: 4, lineHeight: 26 },
  sub: { ...typography.caption, color: colors.orangeHighlight, fontSize: 10, letterSpacing: 1.8 },
});
