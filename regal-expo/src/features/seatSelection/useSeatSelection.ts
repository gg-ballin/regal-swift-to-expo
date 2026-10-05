import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AccessibilityInfo, Alert } from 'react-native';

import { useMovieQuery, useSeatMapQuery, useShowtimesQuery } from '@/data/queries';
import { findShowtime } from '@/domain/booking';
import { parseIsoDay } from '@/domain/formatters';
import { useBooking } from '@/store/booking';

const LOAD_ERROR = "Couldn't load the seat map. Please try again.";

/**
 * Port of `SeatSelectionViewModel` + the controller's side effects (haptics, alerts, navigation).
 * The route only carries ids, so a deep link rebuilds the selection from the query cache.
 */
export function useSeatSelection(showtimeId: string, dateParam: string | undefined) {
  const router = useRouter();
  const selection = useBooking((s) => s.selection);
  const selected = useBooking((s) => s.selected);
  const maxSeats = useBooking((s) => s.maxSeats);
  const setSelection = useBooking((s) => s.setSelection);
  const toggleInStore = useBooking((s) => s.toggleSeat);
  const checkoutInStore = useBooking((s) => s.checkout);

  // SWIFT: not needed; `let selection: ShowtimeSelection` is injected, only `-demoRoute seats` rebuilds one (TicketsCoordinator).
  const needsRehydration = selection?.showtime.id !== showtimeId;
  const movieQuery = useMovieQuery();
  const showtimesQuery = useShowtimesQuery();
  // SWIFT: viewDidLoad -> `Task { await viewModel.load() }`.
  const seatMapQuery = useSeatMapQuery(showtimeId);
  const seatMap = seatMapQuery.data;

  useEffect(() => {
    if (!needsRehydration || !movieQuery.data || !showtimesQuery.data) return;
    const match = findShowtime(showtimesQuery.data.theatres, showtimeId);
    if (!match) return;
    const date = (dateParam && parseIsoDay(dateParam)) || new Date();
    setSelection({ movie: movieQuery.data, ...match, date });
  }, [needsRehydration, movieQuery.data, showtimesQuery.data, showtimeId, dateParam, setSelection]);

  const { isError, isFetching, errorUpdatedAt, refetch } = seatMapQuery;
  // SWIFT: presentError(_:): UIAlertController(.alert) with "Retry" (reloads) + "Cancel" (.cancel), guarded by presentedViewController == nil.
  useEffect(() => {
    if (!isError || isFetching) return;
    Alert.alert('Seat map unavailable', LOAD_ERROR, [
      { text: 'Retry', onPress: () => void refetch() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [isError, isFetching, errorUpdatedAt, refetch]);

  // SWIFT: collectionView(_:didSelectItemAt:) switching on viewModel.toggle(seatID:): haptics.selection() / haptics.warning() + announceMaxReached().
  const toggle = useCallback(
    (seatId: string) => {
      const result = toggleInStore(seatMap, seatId);
      if (result.type === 'selected' || result.type === 'deselected') {
        void Haptics.selectionAsync();
      } else if (result.reason === 'maxReached') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        const message = `You can select up to ${maxSeats} seats.`;
        // SWIFT: UIAccessibility.post(notification: .announcement, argument: message).
        AccessibilityInfo.announceForAccessibility(message);
        Alert.alert('Seat limit reached', message, [{ text: 'OK' }]);
      }
    },
    [toggleInStore, seatMap, maxSeats],
  );

  // SWIFT: viewModel.checkout() -> onCheckout -> TicketsCoordinator.showTicket(_:): haptics.success() + pushViewController.
  const checkout = useCallback(() => {
    const ticket = checkoutInStore(seatMap);
    if (!ticket) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({ pathname: '/ticket/[ticketId]', params: { ticketId: ticket.id } });
  }, [checkoutInStore, seatMap, router]);

  return {
    selection: needsRehydration ? null : selection,
    seatMap,
    selected,
    isLoading: seatMapQuery.isFetching && !seatMap,
    toggle,
    checkout,
  };
}
