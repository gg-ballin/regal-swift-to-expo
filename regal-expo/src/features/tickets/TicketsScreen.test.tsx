// SWIFT: Tests/TicketHistoryTests.swift (TicketHistoryViewModelTests: rows newest first, select emits the ticket).
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Ticket } from '@/domain/booking';
import { bookingStore } from '@/store/booking';
import * as Fixtures from '@/test/fixtures';

import { TicketsScreen } from './TicketsScreen';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

function ticket(id: string, purchasedAt: Date): Ticket {
  return {
    id,
    selection: Fixtures.selection,
    auditorium: 'Auditorium 1',
    seatIds: ['A1'],
    totalCents: 1549,
    currency: 'USD',
    purchasedAt,
  };
}

beforeEach(() => {
  mockPush.mockClear();
  bookingStore.setState({ tickets: {} });
});

describe('TicketsScreen', () => {
  test('shows the empty state without purchases', async () => {
    await render(<TicketsScreen />);

    expect(screen.getByText('Tickets you buy will appear here')).toBeOnTheScreen();
  });

  test('lists purchases newest first and reopens the tapped ticket', async () => {
    bookingStore.setState({
      tickets: {
        old: ticket('aaaaaaaa-old', new Date(1_000)),
        new: ticket('bbbbbbbb-new', new Date(2_000)),
      },
    });

    await render(<TicketsScreen />);

    expect(screen.getAllByText(/^[AB]{8}$/).map((node) => node.props.children)).toEqual(['BBBBBBBB', 'AAAAAAAA']);

    fireEvent.press(screen.getByLabelText(/code AAAAAAAA/));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/ticket/[ticketId]', params: { ticketId: 'aaaaaaaa-old' } });
  });
});
