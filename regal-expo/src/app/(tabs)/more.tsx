import { Placeholder } from '@/components/Placeholder';

// SWIFT: AppCoordinator.makeRoot(for: .more) -> UINavigationController(rootViewController: PlaceholderViewController).
export default function MoreScreen() {
  return <Placeholder title="More" symbol={{ ios: 'ellipsis', android: 'more_horiz' }} />;
}
