export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let audioContext: AudioContext | null = null;

function tone(frequency: number, start: number, duration: number, type: OscillatorType = 'sine'): void {
  try {
    audioContext ??= new AudioContext();
    const ac = audioContext;
    const oscillator = ac.createOscillator();
    const gain = ac.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const t0 = ac.currentTime + start;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    oscillator.connect(gain).connect(ac.destination);
    oscillator.start(t0);
    oscillator.stop(t0 + duration + 0.05);
  } catch {
    // No audio available: play silently.
  }
}

/** Short rising three-note cheer. */
export function playCorrect(): void {
  tone(523, 0, 0.15);
  tone(659, 0.12, 0.15);
  tone(784, 0.24, 0.25);
}

/** Soft low tone, deliberately not a harsh buzzer. */
export function playWrong(): void {
  tone(220, 0, 0.3, 'triangle');
}

const COLORS = ['#ffb84d', '#6fcf97', '#56ccf2', '#6247e8', '#ff7aa2'];

export function confetti(container: HTMLElement): void {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = COLORS[i % COLORS.length];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 200)}px`);
    piece.addEventListener('animationend', () => piece.remove());
    container.append(piece);
  }
}
