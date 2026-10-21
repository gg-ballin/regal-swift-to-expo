import { Tabs } from 'expo-router';
import { Icon } from '@/components/Icon';
import { regalHeaderOptions } from '@/components/RegalHeader';
import { colors, typography } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...regalHeaderOptions,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { ...typography.caption },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Movies',
          tabBarIcon: ({ color, size }) => (
            <Icon name={{ ios: 'film', android: 'movie', web: 'movie' }} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'My Tickets',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name={{ ios: 'ticket', android: 'confirmation_number', web: 'confirmation_number' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="api"
        options={{
          title: 'API',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name={{ ios: 'waveform.path.ecg', android: 'monitor_heart', web: 'monitor_heart' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
