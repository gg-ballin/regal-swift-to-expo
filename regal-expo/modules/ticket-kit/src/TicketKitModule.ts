import { NativeModule, requireOptionalNativeModule } from 'expo';

import type { TicketKitEvents } from './TicketKit.types';

// SWIFT: typed mirror of `TicketKitModule.definition()` (ios/TicketKitModule.swift): one AsyncFunction per method, Events(...) as the generic.
declare class TicketKitNativeModule extends NativeModule<TicketKitEvents> {
  isCaptured(): Promise<boolean>;
}

/** `null` off iOS: the module only ships an Apple implementation (`expo-module.config.json`). */
export default requireOptionalNativeModule<TicketKitNativeModule>('TicketKit');
