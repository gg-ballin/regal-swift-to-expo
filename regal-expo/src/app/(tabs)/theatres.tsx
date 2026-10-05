import { Placeholder } from '@/components/Placeholder';

// SWIFT: AppCoordinator.makeRoot(for: .theatres) -> UINavigationController(rootViewController: PlaceholderViewController).
export default function TheatresScreen() {
  return <Placeholder title="Theatres" symbol={{ ios: 'mappin.and.ellipse', android: 'location_on' }} />;
}
