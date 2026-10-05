import { NativeTabs } from 'expo-router/native-tabs';

import { colors, typography } from '@/theme/theme';

const label = { ...typography.caption, color: colors.tabInactive };

/** Tab order and symbols mirror `AppCoordinator.Tab`. Movies is `index`, so the launch URL `/` opens it. */
// SWIFT: AppCoordinator.start(): UITabBarController, one UINavigationController per Tab case (NativeTabs renders the same class).
export default function TabsLayout() {
  return (
    // SWIFT: UITabBarAppearance (configureWithOpaqueBackground, backgroundColor, shadowColor, item iconColor/titleTextAttributes);
    // disableTransparentOnScrollEdge = scrollEdgeAppearance set to the same opaque appearance.
    <NativeTabs
      backgroundColor={colors.tabBar}
      shadowColor={colors.border}
      disableTransparentOnScrollEdge
      iconColor={{ default: colors.tabInactive, selected: colors.tabActive }}
      labelStyle={{ default: label, selected: { ...label, color: colors.textPrimary } }}>
      {/* SWIFT: each Trigger = UITabBarItem(title: tab.title.uppercased(), image: UIImage(systemName: tab.symbol)). */}
      <NativeTabs.Trigger name="theatres">
        <NativeTabs.Trigger.Label>THEATRES</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="mappin.and.ellipse" md="location_on" />
      </NativeTabs.Trigger>
      {/* SWIFT: tabBarController.selectedIndex = Tab.movies.rawValue. */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>MOVIES</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ticket.fill" md="confirmation_number" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rewards">
        <NativeTabs.Trigger.Label>REWARDS</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="r.circle" md="stars" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>MORE</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ellipsis" md="more_horiz" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
