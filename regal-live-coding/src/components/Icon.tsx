import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type Props = {
  /** SF Symbol, or `{ ios, android, web }` so Android/web get a Material Symbol. A string renders on iOS only. */
  name: SymbolViewProps['name'];
  size?: number;
  color?: ColorValue;
  weight?: SymbolViewProps['weight'];
};

/** Same wrapper as regal-expo: SF Symbols on iOS, Material Symbols on Android/web. */
export function Icon({ name, size = 17, color, weight = 'regular' }: Props) {
  return <SymbolView name={name} size={size} tintColor={color} weight={weight} />;
}
