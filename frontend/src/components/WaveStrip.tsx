import type { FC } from 'react';

interface WaveStripProps {
  reducedMotion: boolean;
  className?: string;
}

// Deniz atmosferi - gradyanlı, 3 katmanlı (uzak/orta/yakın) kayan dalga şeridi.
// Hem hero viewport'un altında (fold üstü, ilk açılışta görünür) hem sayfanın
// en altında (footer arka planı) yeniden kullanılıyor.
export const WaveStrip: FC<WaveStripProps> = ({ reducedMotion, className = '' }) => (
  <div className={`absolute inset-x-0 bottom-0 h-48 sm:h-64 overflow-hidden pointer-events-none select-none ${className}`}>
    {/* Uzak dalga - sakin, geniş dalga boyu, en soluk */}
    <div className={reducedMotion ? '' : 'animate-wave-bob-slow'}>
      <div className={`flex h-48 sm:h-64 w-[200%] ${reducedMotion ? '' : 'animate-wave-drift-slow'}`}>
        {[0, 1].map(i => (
          <svg key={i} className="w-1/2 h-full shrink-0" viewBox="0 0 1440 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gWaveFar${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            <path d="M0,120 C360,90 1080,150 1440,120 L1440,220 L0,220 Z" fill={`url(#gWaveFar${i})`} fillOpacity="0.14" />
          </svg>
        ))}
      </div>
    </div>

    {/* Orta dalga */}
    <div className={`absolute inset-x-0 bottom-0 h-36 sm:h-48 ${reducedMotion ? '' : 'animate-wave-bob-slow'}`}>
      <div className={`flex h-full w-[200%] ${reducedMotion ? '' : 'animate-wave-drift'}`}>
        {[0, 1].map(i => (
          <svg key={i} className="w-1/2 h-full shrink-0" viewBox="0 0 1440 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gWaveMid${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>
            </defs>
            <path
              d="M0,110 C240,70 480,150 720,110 C960,70 1200,150 1440,110 L1440,220 L0,220 Z"
              fill={`url(#gWaveMid${i})`}
              fillOpacity="0.2"
            />
          </svg>
        ))}
      </div>
    </div>

    {/* Yakın dalga - en canlı/koyu, köpük çizgili, en hızlı */}
    <div className={`absolute inset-x-0 bottom-0 h-24 sm:h-32 ${reducedMotion ? '' : 'animate-wave-bob-fast'}`}>
      <div className={`flex h-full w-[200%] ${reducedMotion ? '' : 'animate-wave-drift-fast'}`}>
        {[0, 1].map(i => (
          <svg key={i} className="w-1/2 h-full shrink-0" viewBox="0 0 1440 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gWaveNear${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#155e75" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 C120,60 240,140 360,100 C480,60 600,140 720,100 C840,60 960,140 1080,100 C1200,60 1320,140 1440,100 L1440,220 L0,220 Z"
              fill={`url(#gWaveNear${i})`}
              fillOpacity="0.3"
            />
            <path
              d="M0,100 C120,60 240,140 360,100 C480,60 600,140 720,100 C840,60 960,140 1080,100 C1200,60 1320,140 1440,100"
              fill="none"
              stroke="white"
              strokeOpacity="0.35"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        ))}
      </div>
    </div>
  </div>
);
