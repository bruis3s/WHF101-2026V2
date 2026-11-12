'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

interface ModularPieceDef {
  id: string;
  image: string;
  width: number;
  height: number;
  baseX: number;
  baseY: number;
  defaultZ: number;
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
  },
  {
    id: 'arc-02',
    image: '/images/projects/saucony-aw25/modular-02.png',
    width: 149,
    height: 165,
    baseX: 9,
    baseY: 68,
    defaultZ: 2,
  },
  {
    id: 'arc-03',
    image: '/images/projects/saucony-aw25/modular-03.png',
    width: 163,
    height: 141,
    baseX: 83,
    baseY: 10,
    defaultZ: 3,
  },
  {
    id: 'arc-04',
    image: '/images/projects/saucony-aw25/modular-04.png',
    width: 212,
    height: 118,
    baseX: 229,
    baseY: 0,
    defaultZ: 4,
  },
  {
    id: 'arc-05',
    image: '/images/projects/saucony-aw25/modular-05.png',
    width: 182,
    height: 154,
    baseX: 389,
    baseY: 30,
    defaultZ: 5,
  },
  {
    id: 'arc-06',
    image: '/images/projects/saucony-aw25/modular-06.png',
    width: 142,
    height: 191,
    baseX: 441,
    baseY: 128,
    defaultZ: 6,
  },
  {
    id: 'arc-07',
    image: '/images/projects/saucony-aw25/modular-07.png',
    width: 230,
    height: 195,
    baseX: 316,
    baseY: 228,
    defaultZ: 7,
  },
  {
    id: 'arc-08',
    image: '/images/projects/saucony-aw25/modular-08.png',
    width: 262,
    height: 159,
    baseX: 83,
    baseY: 278,
    defaultZ: 8,
  },
];

interface DraggableModularCircleProps {
  headline?: string;
}

export function DraggableModularCircle({ headline }: DraggableModularCircleProps) {
  const arenaRef = useRef<HTMLDivElement>(null);

  const bringToFront = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentZ = parseInt(target.style.zIndex || '1', 10);
    target.style.zIndex = String(currentZ + 20);
  }, []);

  return (
    <section
      id="row-interactive-modular"
      className="editorialRow interactiveModularRow"
      data-lenis-prevent
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

      <div className="modularArena" ref={arenaRef} data-lenis-prevent>
        {PIECES.map((p) => (
          <motion.div
            key={p.id}
            className="modularPiece"
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
