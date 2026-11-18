'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useInView, useAnimation } from 'motion/react';

interface ModularPieceDef {
  id: string;
  image: string;
  width: number;
  height: number;
  baseX: number;
  baseY: number;
  defaultZ: number;
  dirX: number;
  dirY: number;
}

const PIECES: ModularPieceDef[] = [
  {
    id: 'arc-01',
    image: '/images/projects/saucony-aw25/modular-01.png',
    width: 192,
    height: 202,
    baseX: 0,
    baseY: 184,
    defaultZ: 1,
    dirX: -0.947,
    dirY: 0.320,
  },
  {
    id: 'arc-02',
    image: '/images/projects/saucony-aw25/modular-02.png',
    width: 149,
    height: 165,
    baseX: 9,
    baseY: 68,
    defaultZ: 2,
    dirX: -0.950,
    dirY: -0.313,
  },
  {
    id: 'arc-03',
    image: '/images/projects/saucony-aw25/modular-03.png',
    width: 163,
    height: 141,
    baseX: 83,
    baseY: 10,
    defaultZ: 3,
    dirX: -0.676,
    dirY: -0.737,
  },
  {
    id: 'arc-04',
    image: '/images/projects/saucony-aw25/modular-04.png',
    width: 212,
    height: 118,
    baseX: 229,
    baseY: 0,
    defaultZ: 4,
    dirX: 0.262,
    dirY: -0.965,
  },
  {
    id: 'arc-05',
    image: '/images/projects/saucony-aw25/modular-05.png',
    width: 182,
    height: 154,
    baseX: 389,
    baseY: 30,
    defaultZ: 5,
    dirX: 0.860,
    dirY: -0.511,
  },
  {
    id: 'arc-06',
    image: '/images/projects/saucony-aw25/modular-06.png',
    width: 142,
    height: 191,
    baseX: 441,
    baseY: 128,
    defaultZ: 6,
    dirX: 1.000,
    dirY: 0.020,
  },
  {
    id: 'arc-07',
    image: '/images/projects/saucony-aw25/modular-07.png',
    width: 230,
    height: 195,
    baseX: 316,
    baseY: 228,
    defaultZ: 7,
    dirX: 0.795,
    dirY: 0.607,
  },
  {
    id: 'arc-08',
    image: '/images/projects/saucony-aw25/modular-08.png',
    width: 262,
    height: 159,
    baseX: 83,
    baseY: 278,
    defaultZ: 8,
    dirX: -0.488,
    dirY: 0.873,
  },
];

interface DraggableModularCircleProps {
  headline?: string;
}

export function DraggableModularCircle({ headline }: DraggableModularCircleProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [spreadDist, setSpreadDist] = useState(170);

  useEffect(() => {
    const updateSpread = () => {
      setSpreadDist(window.innerWidth <= 810 ? 70 : 170);
    };
    updateSpread();
    window.addEventListener('resize', updateSpread);
    return () => window.removeEventListener('resize', updateSpread);
  }, []);

  const isInView = useInView(sectionRef, {
    amount: 0.35,
    once: true,
  });

  useEffect(() => {
    if (isInView) {
      controls.start((idx: number) => ({
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1], // easeOutExpo
          delay: idx * 0.035,
        },
      }));
    }
  }, [isInView, controls]);

  const bringToFront = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentZ = parseInt(target.style.zIndex || '1', 10);
    target.style.zIndex = String(currentZ + 20);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="row-interactive-modular"
      className="editorialRow interactiveModularRow"
      aria-label="Interactive circular modular object layout"
    >
      <div className="modularTextWrapper">
        <div className="modularHeadline">
          {headline || (
            <>
              We believe the exploration should be experienced by anyone who interested in how the
              object works.
              <br />
              So, layout it yourself
            </>
          )}
        </div>
      </div>

      <div className="modularArena" ref={arenaRef}>
        {PIECES.map((p, idx) => (
          <motion.div
            key={p.id}
            className="modularPiece"
            custom={idx}
            initial={{
              x: p.dirX * spreadDist,
              y: p.dirY * spreadDist,
              scale: 1.03,
            }}
            animate={controls}
            drag
            dragMomentum={false}
            dragElastic={0.05}
            onPointerDown={bringToFront}
            whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
            style={
              {
                '--base-x': p.baseX,
                '--base-y': p.baseY,
                '--base-w': p.width,
                '--base-h': p.height,
                zIndex: p.defaultZ,
              } as React.CSSProperties
            }
            tabIndex={0}
            role="button"
            aria-label={`Draggable circular modular arc ${p.id}`}
          >
            <Image
              src={p.image}
              alt={`Circular modular element ${p.id}`}
              fill
              sizes="(max-width: 809.98px) 105px, 262px"
              className="modularImg"
              draggable={false}
              priority
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
