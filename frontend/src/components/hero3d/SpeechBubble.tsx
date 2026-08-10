import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Html } from '@react-three/drei';

interface SpeechBubbleProps {
  text: string;
  position: [number, number, number];
  delayMs?: number;
}

export const SpeechBubble: FC<SpeechBubbleProps> = ({ text, position, delayMs = 600 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <Html position={position} center distanceFactor={8} occlude={false}>
      <div
        className={`relative glass-card rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-normal text-center max-w-[220px] sm:max-w-[260px] shadow-xl transition-all duration-500 ease-out ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'
        }`}
      >
        <span>{text}</span>
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-inherit border-b border-l border-inherit" />
      </div>
    </Html>
  );
};
