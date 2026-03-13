import { useRef, useState, type ReactNode } from 'react';

interface SwipeContainerProps {
  children: ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  enabled: boolean;
}

export function SwipeContainer({ children, onSwipeRight, onSwipeLeft, enabled }: SwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const threshold = 100;

  const handleStart = (clientX: number) => {
    if (!enabled) return;
    startX.current = clientX;
    isDragging.current = true;
    setDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current) return;
    setDragX(clientX - startX.current);
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);

    if (dragX > threshold) {
      setExiting('right');
      setTimeout(() => { onSwipeRight(); setExiting(null); setDragX(0); }, 250);
    } else if (dragX < -threshold) {
      setExiting('left');
      setTimeout(() => { onSwipeLeft(); setExiting(null); setDragX(0); }, 250);
    } else {
      setDragX(0);
    }
  };

  const rotation = dragging ? dragX * 0.05 : 0;
  const exitTranslate = exiting === 'right' ? 'translateX(120vw)' : exiting === 'left' ? 'translateX(-120vw)' : '';

  const overlayColor = dragX > 30 ? `rgba(45, 106, 79, ${Math.min(dragX / 300, 0.25)})` :
                        dragX < -30 ? `rgba(215, 60, 55, ${Math.min(Math.abs(dragX) / 300, 0.25)})` : 'transparent';

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      style={{
        transform: exiting
          ? `${exitTranslate} rotate(${exiting === 'right' ? 15 : -15}deg)`
          : `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: dragging ? 'none' : 'transform 0.25s ease-out',
        position: 'relative',
        touchAction: 'pan-y',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: overlayColor,
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 1,
        transition: dragging ? 'none' : 'background 0.2s',
      }} />
      {children}
    </div>
  );
}
