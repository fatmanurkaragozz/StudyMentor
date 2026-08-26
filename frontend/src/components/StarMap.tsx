import { useMemo } from 'react';
import type { FC } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

// 1000x600'lük soyut bir koordinat uzayında sabit yıldız konumları (viewBox ile gerçek
// kapsayıcı boyutuna esnek şekilde ölçeklenir). Orta-üst bölge (x:250-750, y:60-240) bilinçli
// olarak boş bırakıldı - o bölge genelde başlık metninin oturduğu yer, ve CONNECTION_DISTANCE
// (150) bu boşluğu aşacak kadar uzun bir çizgi oluşturamayacağından metnin üzerinden çizgi
// geçmesi engellenmiş oluyor.
const STAR_POINTS: [number, number][] = [
  [40, 60], [150, 140], [60, 240], [180, 320], [40, 420], [160, 500], [70, 580],
  [950, 80], [820, 150], [900, 260], [800, 340], [940, 420], [830, 500], [960, 580],
  [280, 300], [420, 260], [560, 320], [700, 280], [350, 400], [500, 440], [650, 400],
  [420, 520], [580, 560], [300, 480], [750, 500], [480, 580], [620, 260],
  [100, 350], [900, 180], [350, 580],
];

// `extended` modunda mevcut yıldızlara eklenen ikinci bölge (y:600-1150) - açılış
// sayfasında yıldız haritasının geri bildirim bölümü ve footer'ın arkasına doğru
// genişlemesi için kullanılır. Aynı ilke: orta-üst bant (x:250-750, y:600-820) geri
// bildirim başlığının oturduğu yer olduğu için boş; alt uca inildikçe yoğunluk azalır
// (kullanım yerindeki mask-image soluması ile birleşince "sona doğru sakinleşen" his
// oluşturuyor).
const EXTENDED_STAR_POINTS: [number, number][] = [
  [60, 650], [180, 720], [70, 800], [920, 660], [830, 730], [940, 810],
  [280, 880], [450, 850], [620, 900], [780, 860], [150, 920],
  [500, 980], [850, 950], [120, 1020], [700, 1040],
  [350, 1080], [600, 1100],
];

const CONNECTION_DISTANCE = 150;

interface StarMapProps {
  lineColor?: string;
  starColor?: string;
  extended?: boolean;
  className?: string;
}

export const StarMap: FC<StarMapProps> = ({
  lineColor = '#94a3b8',
  starColor = '#e2e8f0',
  extended = false,
  className = '',
}) => {
  const reducedMotion = useReducedMotion();

  const points = useMemo(
    () => (extended ? [...STAR_POINTS, ...EXTENDED_STAR_POINTS] : STAR_POINTS),
    [extended]
  );

  const connections = useMemo(() => {
    const lines: [number, number, number, number][] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[j];
        if (Math.hypot(x1 - x2, y1 - y2) < CONNECTION_DISTANCE) {
          lines.push([x1, y1, x2, y2]);
        }
      }
    }
    return lines;
  }, [points]);

  return (
    <svg
      className={`absolute inset-0 w-full h-full opacity-[0.65] pointer-events-none select-none ${className}`}
      viewBox={extended ? '0 0 1000 1150' : '0 0 1000 600'}
      preserveAspectRatio="xMidYMid slice"
    >
      {connections.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={lineColor} strokeWidth="1" opacity="0.35" />
      ))}
      {points.map(([x, y], i) => (
        <g
          key={i}
          className={reducedMotion ? '' : 'animate-star-twinkle'}
          style={reducedMotion ? undefined : { animationDelay: `${(i * 0.37) % 4}s`, animationDuration: `${3 + (i % 5) * 0.4}s` }}
        >
          <circle cx={x} cy={y} r="9" fill={starColor} opacity="0.35" style={{ filter: 'blur(4px)' }} />
          <circle cx={x} cy={y} r="3" fill={starColor} />
        </g>
      ))}
    </svg>
  );
};
