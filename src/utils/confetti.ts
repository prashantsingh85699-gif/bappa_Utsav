import confetti from 'canvas-confetti';

export function fireFestiveConfetti() {
  try {
    // Left cannon
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.8 },
      colors: ['#F59E0B', '#EA580C', '#BE123C', '#FDE047', '#FFFFFF'],
    });

    // Right cannon
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.8 },
      colors: ['#F59E0B', '#EA580C', '#BE123C', '#FDE047', '#FFFFFF'],
    });
  } catch {
    // Fallback if canvas blocked
  }
}

export function fireGoldenShower() {
  try {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.3 },
      colors: ['#FDE047', '#F59E0B', '#FBBF24', '#FEF08A'],
    });
  } catch {
    // ignore
  }
}
