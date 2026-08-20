import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { HeroIntroStage } from '../hooks/useHeroIntroSequence';

interface DeskHeroAnimationProps {
  stage: HeroIntroStage;
}

const STAGE_INDEX: Record<HeroIntroStage, number> = { desk: 0, hand: 1, route: 2, modes: 3 };

export const DeskHeroAnimation: FC<DeskHeroAnimationProps> = ({ stage }) => {
  const stageIndex = STAGE_INDEX[stage];
  const trunkRef = useRef<SVGPathElement>(null);
  const leftBranchRef = useRef<SVGPathElement>(null);
  const rightBranchRef = useRef<SVGPathElement>(null);
  const checkRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    [trunkRef, leftBranchRef, rightBranchRef, checkRef].forEach(ref => {
      const el = ref.current;
      if (!el) return;
      const length = el.getTotalLength();
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
    });
  }, []);

  useEffect(() => {
    if (checkRef.current && stageIndex >= STAGE_INDEX.hand) {
      checkRef.current.style.strokeDashoffset = '0';
    }
    if (trunkRef.current && stageIndex >= STAGE_INDEX.route) {
      trunkRef.current.style.strokeDashoffset = '0';
    }
    if (stageIndex >= STAGE_INDEX.route) {
      const timer = setTimeout(() => {
        if (leftBranchRef.current) leftBranchRef.current.style.strokeDashoffset = '0';
        if (rightBranchRef.current) rightBranchRef.current.style.strokeDashoffset = '0';
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [stageIndex]);

  return (
    <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
      <svg
        viewBox="0 0 600 420"
        className={`w-full h-auto transition-opacity duration-700 ${stageIndex >= STAGE_INDEX.desk ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Masa yüzeyi */}
        <rect x="0" y="0" width="600" height="420" rx="28" className="fill-slate-100 dark:fill-slate-900" />

        {/* Laptop */}
        <g>
          <rect x="40" y="30" width="180" height="10" rx="4" className="fill-slate-400 dark:fill-slate-600" />
          <rect x="40" y="40" width="180" height="120" rx="12" className="fill-slate-300 dark:fill-slate-700" />
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 7 }).map((_, col) => (
              <rect
                key={`key-${row}-${col}`}
                x={54 + col * 22}
                y={58 + row * 20}
                width={16}
                height={12}
                rx={3}
                className="fill-slate-100 dark:fill-slate-800"
              />
            ))
          )}
          <rect x="95" y="142" width="70" height="12" rx="6" className="fill-slate-400 dark:fill-slate-600" />
          {/* Kapaktaki pusula işareti - logoyla bilinçli bağ */}
          <circle cx="130" cy="35" r="5" className="fill-none stroke-indigo-500" strokeWidth="1.5" />
          <path d="M130 32 L130 38 M127 35 L133 35" className="stroke-indigo-500" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Kitap yığını */}
        <g>
          <rect x="55" y="255" width="110" height="70" rx="8" transform="rotate(-5 110 290)" className="fill-indigo-200 dark:fill-indigo-900/50" />
          <rect x="62" y="245" width="100" height="65" rx="8" transform="rotate(4 112 277)" className="fill-violet-200 dark:fill-violet-900/50" />
          <rect x="68" y="238" width="88" height="55" rx="8" transform="rotate(-2 112 265)" className="fill-white dark:fill-slate-700" />
          <rect x="72" y="238" width="6" height="55" transform="rotate(-2 112 265)" className="fill-indigo-500" />
        </g>

        {/* Kahve fincanı */}
        <g>
          <circle cx="500" cy="300" r="30" className="fill-slate-300 dark:fill-slate-700" />
          <circle cx="500" cy="300" r="21" className="fill-slate-400 dark:fill-slate-800" />
          <path d="M528 292 Q548 300 528 312" className="fill-none stroke-slate-300 dark:stroke-slate-700" strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* Saksı bitki */}
        <g>
          <path d="M505 70 L535 70 L528 92 L512 92 Z" className="fill-slate-300 dark:fill-slate-700" />
          <path d="M520 70 C505 45 500 30 512 15" className="fill-none stroke-emerald-500" strokeWidth="4" strokeLinecap="round" />
          <path d="M520 70 C530 40 542 28 552 22" className="fill-none stroke-emerald-500" strokeWidth="4" strokeLinecap="round" />
          <path d="M520 70 C518 38 522 20 520 8" className="fill-none stroke-emerald-500" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Açık defter */}
        <g>
          <rect
            x="205"
            y="170"
            width="230"
            height="175"
            rx="12"
            className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="1.5"
          />
          <line x1="320" y1="180" x2="320" y2="335" className="stroke-slate-200 dark:stroke-slate-600" strokeWidth="2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`rule-l-${i}`}
              x1="240"
              y1={215 + i * 24}
              x2="308"
              y2={215 + i * 24}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="2"
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`rule-r-${i}`}
              x1="332"
              y1={195 + i * 24}
              x2="418"
              y2={195 + i * 24}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="2"
            />
          ))}
          <rect x="216" y="192" width="14" height="14" rx="3" className="fill-indigo-600" />
          <path
            ref={checkRef}
            d="M219 199 L224 204 L231 195"
            className="fill-none stroke-white transition-all duration-500 ease-out"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="216" y="216" width="14" height="14" rx="3" className="fill-none stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" />
        </g>

        {/* El + kalem - günlük planı yazıyor */}
        <g
          className={`transition-all duration-700 ease-out ${
            stageIndex >= STAGE_INDEX.hand ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <path
            d="M420 300 C400 300 388 320 392 345 C395 365 415 378 440 375 C462 373 478 358 476 338 C474 322 460 308 442 302 Z"
            className="fill-slate-300 dark:fill-slate-600 stroke-slate-400 dark:stroke-slate-500"
            strokeWidth="1.5"
          />
          <path d="M405 302 C398 288 400 272 410 262" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="14" strokeLinecap="round" />
          <path d="M420 296 C416 280 420 264 432 254" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="13" strokeLinecap="round" />
          <path d="M438 296 C438 278 445 262 458 254" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="13" strokeLinecap="round" />
          <path d="M455 300 C460 284 470 272 482 268" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="12" strokeLinecap="round" />
          <rect x="330" y="278" width="14" height="90" rx="6" transform="rotate(38 337 323)" className="fill-indigo-600 dark:fill-indigo-400" />
          <rect x="330" y="278" width="14" height="16" rx="4" transform="rotate(38 337 323)" className="fill-slate-800 dark:fill-slate-200" />
        </g>

        {/* Rota çizgisi - kalem ucundan aşağı, sonra Öğrenci/Gelişim uçlarına çatallanıyor */}
        <g className={`transition-opacity duration-500 ${stageIndex >= STAGE_INDEX.route ? 'opacity-100' : 'opacity-0'}`}>
          <path
            ref={trunkRef}
            d="M336 300 C332 335 312 368 296 392"
            className="fill-none stroke-indigo-500 dark:stroke-indigo-400 transition-all duration-[900ms] ease-out"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            ref={leftBranchRef}
            d="M296 392 C258 402 200 408 150 410"
            className="fill-none stroke-indigo-500 dark:stroke-indigo-400 transition-all duration-[700ms] ease-out"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            ref={rightBranchRef}
            d="M296 392 C336 402 396 408 450 410"
            className="fill-none stroke-violet-500 dark:stroke-violet-400 transition-all duration-[700ms] ease-out"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="150" cy="410" r={stageIndex >= STAGE_INDEX.modes ? 5 : 0} className="fill-indigo-600 transition-all duration-300" />
          <circle cx="450" cy="410" r={stageIndex >= STAGE_INDEX.modes ? 5 : 0} className="fill-violet-600 transition-all duration-300" />
        </g>
      </svg>
    </div>
  );
};
