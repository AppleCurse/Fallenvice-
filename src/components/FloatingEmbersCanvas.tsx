import React, { useEffect, useRef } from 'react';

interface Tane {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  life: number;
  decay: number;
  sway: number;
  swaySpeed: number;
  hue: number;
}

interface Smoke {
  x: number;
  y: number;
  size: number;
  life: number;
  decay: number;
  dx: number;
  dy: number;
}

export const FloatingEmbersCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const createTane = (randomY = true): Tane => ({
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + Math.random() * 40,
      size: Math.random() * 2.2 + 0.6,
      speedY: -(Math.random() * 0.45 + 0.15),
      speedX: (Math.random() - 0.5) * 0.25,
      life: Math.random() * 0.8 + 0.2,
      decay: Math.random() * 0.0018 + 0.0006,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.012 + 0.004,
      hue: 28 + Math.random() * 14,
    });

    const embers: Tane[] = Array.from({ length: 32 }, () => createTane(true));
    let smokePuffs: Smoke[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.65) {
        smokePuffs.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 14 + 6,
          life: 1,
          decay: Math.random() * 0.014 + 0.008,
          dx: (Math.random() - 0.5) * 0.6,
          dy: -(Math.random() * 1.0 + 0.3),
        });
      }
      if (smokePuffs.length > 35) {
        smokePuffs.splice(0, 10);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update embers
      for (let i = 0; i < embers.length; i++) {
        const t = embers[i];
        t.sway += t.swaySpeed;
        t.x += t.speedX + Math.sin(t.sway) * 0.3;
        t.y += t.speedY;
        t.life -= t.decay;

        if (t.life <= 0 || t.y < -30 || t.x < -20 || t.x > width + 20) {
          embers[i] = createTane(false);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, t.life * 0.55);
        ctx.fillStyle = `hsl(${t.hue}, 70%, 55%)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(184, 136, 74, 0.45)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render & update smoke puffs
      for (let i = 0; i < smokePuffs.length; i++) {
        const s = smokePuffs[i];
        s.x += s.dx;
        s.y += s.dy;
        s.size += 0.35;
        s.life -= s.decay;

        if (s.life > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, s.life * 0.05);
          ctx.fillStyle = '#2d241c';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      smokePuffs = smokePuffs.filter((s) => s.life > 0);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
};
