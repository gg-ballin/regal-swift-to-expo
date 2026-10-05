// SWIFT: TicketViewModelQRTests (QRCodeStoreTests.swift): door text for generated, failed and captured states.
import { render, screen } from '@testing-library/react-native';

import { QRSection } from './QRSection';

// Reanimated 4 needs native worklets at import time; the shield animation is irrelevant here.
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const transition = { duration: () => transition };
  return { __esModule: true, default: { View }, FadeIn: transition, FadeOut: transition };
});

describe('QRSection', () => {
  test('shows the code for a valid payload', async () => {
    await render(<QRSection payload='{"ticketId":"t-1"}' isCaptured={false} />);

    expect(screen.getByLabelText('Ticket QR code')).toBeOnTheScreen();
    expect(screen.getByText('Show this at the door')).toBeOnTheScreen();
  });

  test('shows the generation error when the payload cannot be encoded', async () => {
    await render(<QRSection payload="" isCaptured={false} />);

    expect(screen.getByText("Couldn't generate your ticket code.")).toBeOnTheScreen();
  });

  test('hides the code while the screen is being recorded', async () => {
    await render(<QRSection payload='{"ticketId":"t-1"}' isCaptured />);

    expect(screen.getByLabelText('Ticket code hidden while the screen is being recorded')).toBeOnTheScreen();
    expect(screen.getByText('Stop screen recording to show your code')).toBeOnTheScreen();
  });
});
