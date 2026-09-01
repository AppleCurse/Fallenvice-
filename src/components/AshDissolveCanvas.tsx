import React, { useEffect, useRef } from 'react';

interface AshParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
  color: string;
}

export const AshDissolveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<AshParticle[]>([]);

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

    const triggerAshAt = (cx: number, cy: number, count = 20) => {
      for (let i = 0; i < count; i++) {
        const hue = 25 + Math.random() * 20;
        const sat = 30 + Math.random() * 30;
        const light = 25 + Math.random() * 30;
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 120,
          y: cy + (Math.random() - 0.5) * 40,
          size: Math.random() * 3.5 + 1.2,
          speedX: (Math.random() - 0.5) * 2.4,
          speedY: -(Math.random() * 2.2 + 0.6),
          life: 1,
          decay: Math.random() * 0.016 + 0.006,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 6,
          color: `hsl(${hue}, ${sat}%, ${light}%)`,
        });
      }
    };

    // Listen to custom ash trigger event
    const handleAshTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; count?: number }>;
      if (customEvent.detail) {
        triggerAshAt(customEvent.detail.x, customEvent.detail.y, customEvent.detail.count || 22);
      }
    };
    window.addEventListener('trigger-ash', handleAshTrigger);

    // Watch elements with data-kul="gecti"
    const kulState = new Map<Element, boolean>();

    const checkKulElements = () => {
      const elements = document.querySelectorAll('[data-kul="gecti"]');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const passedTop = rect.bottom < window.innerHeight * 0.25;
        const previousState = kulState.get(el) || false;

        if (passedTop && !previousState) {
          kulState.set(el, true);
          const cx = rect.left + rect.width / 2;
          const cy = Math.max(20, rect.bottom);
          triggerAshAt(cx, cy, 26);
        } else if (!passedTop && previousState) {
          kulState.set(el, false);
        }
      });
    };

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      checkKulElements();

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY -= 0.015; // float upward
        p.speedX *= 0.99;
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
        p.size *= 0.995;

        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life * 0.7);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }

      particlesRef.current = particles.filter((p) => p.life > 0);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('trigger-ash', handleAshTrigger);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45]"
      aria-hidden="true"
    />
  );
};
