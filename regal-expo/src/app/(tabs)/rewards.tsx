import { Placeholder } from '@/components/Placeholder';

// SWIFT: AppCoordinator.makeRoot(for: .rewards) -> UINavigationController(rootViewController: PlaceholderViewController).
export default function RewardsScreen() {
  return <Placeholder title="Rewards" symbol={{ ios: 'r.circle', android: 'stars' }} />;
}
