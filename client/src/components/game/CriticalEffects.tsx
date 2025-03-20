import confetti from 'canvas-confetti';
import { useEffect } from 'react';

type Props = {
  type: 'success' | 'failure';
  onComplete?: () => void;
};

export function CriticalEffects({ type, onComplete }: Props) {
  useEffect(() => {
    if (type === 'success') {
      // Effet de confettis pour un 20 naturel
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else if (onComplete) {
          onComplete();
        }
      };

      frame();
    } else {
      // Effet pour un 1 naturel
      document.body.classList.add('critical-failure');
      const lightning = document.createElement('div');
      lightning.className = 'lightning';
      document.body.appendChild(lightning);

      const skull = document.createElement('div');
      skull.className = 'skull';
      skull.innerHTML = '💀';
      document.body.appendChild(skull);

      const timer = setTimeout(() => {
        document.body.classList.remove('critical-failure');
        lightning.remove();
        skull.remove();
        if (onComplete) onComplete();
      }, 2000);

      return () => {
        clearTimeout(timer);
        document.body.classList.remove('critical-failure');
        lightning.remove();
        skull.remove();
      };
    }
  }, [type, onComplete]);

  return null;
}
