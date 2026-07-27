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
        className={`relative glass-card rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap shadow-xl transition-all duration-500 ease-out ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'
        }`}
      >
        <span>{text}</span>
        <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-inherit border-b border-r border-inherit" />
      </div>
    </Html>
  );
};
