import { Suspense } from 'react';
import type { FC, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useInViewOnce } from '../../../hooks/useInViewOnce';

interface MiniDecorSceneProps {
  className?: string;
  cameraPosition?: [number, number, number];
  children: ReactNode;
}

export const MiniDecorScene: FC<MiniDecorSceneProps> = ({
  className = '',
  cameraPosition = [0, 0.6, 3],
  children,
}) => {
  const isMobile = useIsMobile();
  const [ref, inView] = useInViewOnce<HTMLDivElement>();

  if (isMobile) return null;

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`}>
      {inView && (
        <Canvas camera={{ position: cameraPosition, fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: false }}>
          <Suspense fallback={null}>
            <ambientLight color="#64748b" intensity={1.2} />
            <directionalLight position={[2, 3, 2]} intensity={0.9} />
            {children}
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};
