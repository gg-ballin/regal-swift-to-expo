// Jest has no NitroModules TurboModule. react-native-mmkv imports it eagerly but swaps in its own
// in-memory MMKV under Jest (`createMockMMKV`), so this stub must never actually be called.
export const NitroModules = {
  createHybridObject: (name: string) => {
    throw new Error(`NitroModules.createHybridObject('${name}') is unavailable under Jest`);
  },
};
