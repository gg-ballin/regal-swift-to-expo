import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, Settings } from 'react-native';

import { useShowtimesQuery } from '@/data/queries';
import { isoDay } from '@/domain/formatters';
import { DEMO_TICKET_ID } from '@/features/ticket/useTicket';

/**
 * Dev-only parity with the Swift `-demoRoute seats|ticket` launch argument (read from NSUserDefaults, like
 * `UserDefaults.standard`). Same targets as the deep links `regalexpo://seats/<id>` and `regalexpo://ticket/demo`,
 * without the simulator's "Open in…?" confirmation.
 */
export function useDemoRoute() {
  const router = useRouter();
  const showtimes = useShowtimesQuery().data;
  const handled = useRef(false);

  useEffect(() => {
    // SWIFT: `#if DEBUG` + `UserDefaults.standard.string(forKey: "demoRoute")` in TicketsCoordinator.start().
    if (!__DEV__ || Platform.OS !== 'ios' || handled.current || !showtimes) return;
    const route: unknown = Settings.get('demoRoute');
    if (route !== 'seats' && route !== 'ticket') return;
    handled.current = true;

    if (route === 'ticket') {
      router.push({ pathname: '/ticket/[ticketId]', params: { ticketId: DEMO_TICKET_ID } });
      return;
    }
    const showtimeId = showtimes.theatres[0]?.formats[0]?.times[0]?.id;
    if (showtimeId) {
      router.push({ pathname: '/seats/[showtimeId]', params: { showtimeId, date: isoDay(new Date()) } });
    }
  }, [showtimes, router]);
}
