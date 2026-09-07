import type { FC } from 'react';
import { Sprout } from 'lucide-react';

interface DecorSproutProps {
  /** Boyutu (ve konumu) burada ver: örn "w-12 h-12" ya da "absolute -top-3 right-3 w-9 h-9" */
  className?: string;
  /** true = STUDENT (pembe aksan), false = LIFELONG_LEARNER (nane) */
  student?: boolean;
}

/**
 * Eskiden bir 3B saksı canvas'ı (MiniDecorScene) olan küçük dekoratif süs -
 * artık sadece marka renkli yuvarlak içinde bir yaprak ikonu. İlk yükte three.js
 * çekmesin diye statik.
 */
export const DecorSprout: FC<DecorSproutProps> = ({ className = '', student = true }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none flex items-center justify-center rounded-full ${
      student
        ? 'bg-brand-pink-dark/10 text-brand-pink-dark dark:text-brand-pink-light'
        : 'bg-brand-mint-dark/10 text-brand-mint-dark dark:text-brand-mint'
    } ${className}`}
  >
    <Sprout className="w-1/2 h-1/2" />
  </div>
);
