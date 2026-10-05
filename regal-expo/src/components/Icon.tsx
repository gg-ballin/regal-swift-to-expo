import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type Props = {
  /** SF Symbol name; Android/web fall back to the matching Material Symbol through `name.android`. */
  name: SymbolViewProps['name'];
  size?: number;
  color?: ColorValue;
  weight?: SymbolViewProps['weight'];
};

// SWIFT: UIImageView(image: UIImage(systemName:)) + UIImage.SymbolConfiguration(pointSize:weight:); color = tintColor.
export function Icon({ name, size = 17, color, weight = 'regular' }: Props) {
  return <SymbolView name={name} size={size} tintColor={color} weight={weight} />;
}
