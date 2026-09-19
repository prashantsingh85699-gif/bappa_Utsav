import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MandapArchitecture } from './MandapArchitecture';
import { FestiveLights } from './FestiveLights';
import { FlowerGarlands } from './FlowerGarlands';

export interface UtsavStageProps {
  intensity?: 'low' | 'medium' | 'high';
  reducedMotion?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  type: 'marigold' | 'saffron' | 'rose' | 'ember';
  opacity: number;
  swayOffset: number;
  swaySpeed: number;
}

export const UtsavStage: React.FC<UtsavStageProps> = ({
  intensity = 'high',
  reducedMotion = false,
  className = '',
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isTabVisibleRef = useRef<boolean>(true);
  const particlesRef = useRef<Particle[]>([]);

  // Parallax offset for desktop mouse motion
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const currentParallaxRef = useRef({ x: 0, y: 0 });

  // Determine viewport type
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  // Calculate particle budget based on intensity and device
  const particleConfig = useMemo(() => {
    let petals = 28;
    let embers = 24;

    if (intensity === 'low') {
      petals = 8;
      embers = 8;
    } else if (intensity === 'medium') {
      petals = 18;
      embers = 16;
    }

    if (isMobile) {
      petals = Math.max(4, Math.floor(petals * 0.45));
      embers = Math.max(4, Math.floor(embers * 0.45));
    }

    return { petals, embers };
  }, [intensity, isMobile]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Mouse Parallax Tracking
  useEffect(() => {
    if (reducedMotion || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseTargetRef.current = {
        x: ((e.clientX - centerX) / centerX) * 12,
        y: ((e.clientY - centerY) / centerY) * 8,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion, isMobile]);

  // Smooth lerp for parallax updates
  useEffect(() => {
    if (reducedMotion || isMobile) {
      setParallax({ x: 0, y: 0 });
      return;
    }

    let rafId: number;
    const updateParallax = () => {
      currentParallaxRef.current.x += (mouseTargetRef.current.x - currentParallaxRef.current.x) * 0.05;
      currentParallaxRef.current.y += (mouseTargetRef.current.y - currentParallaxRef.current.y) * 0.05;

      setParallax({
        x: Math.round(currentParallaxRef.current.x * 10) / 10,
        y: Math.round(currentParallaxRef.current.y * 10) / 10,
      });

      rafId = requestAnimationFrame(updateParallax);
    };

    rafId = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion, isMobile]);

  // Initialize Particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const totalCount = particleConfig.petals + particleConfig.embers;

    for (let i = 0; i < totalCount; i++) {
      const isEmber = i >= particleConfig.petals;
      const types: Particle['type'][] = ['marigold', 'saffron', 'rose'];
      const flowerType = types[Math.floor(Math.random() * types.length)];

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isEmber ? Math.random() * 2.5 + 1.5 : Math.random() * 6 + 7,
        speedY: isEmber ? -(Math.random() * 0.6 + 0.3) : Math.random() * 0.8 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        type: isEmber ? 'ember' : flowerType,
        opacity: isEmber ? Math.random() * 0.6 + 0.4 : Math.random() * 0.55 + 0.35,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.01,
      });
    }

    particlesRef.current = particles;
  }, [particleConfig]);

  // Page Visibility API & Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Handle high DPI scaling (capped at 1.5x for performance)
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles(width, height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Handle Tab Visibility
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isTabVisibleRef.current || reducedMotion) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const delta = Math.min((time - lastTime) / 16.67, 2); // normalize to 60fps
      lastTime = time;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update physics
        p.swayOffset += p.swaySpeed * delta;
        p.x += (p.speedX + Math.sin(p.swayOffset) * 0.5) * delta;
        p.y += p.speedY * delta;
        p.rotation += p.rotSpeed * delta;

        // Wrap around boundaries
        if (p.type === 'ember') {
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else {
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }

        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.type === 'ember') {
          // Sacred Golden Sparkle Ember
          const emberGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2.5);
          emberGlow.addColorStop(0, `rgba(254, 240, 138, ${p.opacity})`);
          emberGlow.addColorStop(0.5, `rgba(245, 158, 11, ${p.opacity * 0.7})`);
          emberGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');

          ctx.fillStyle = emberGlow;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Tumbling Flower Petal
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;

          let colorStart = '#FDE047';
          let colorEnd = '#EA580C';

          if (p.type === 'rose') {
            colorStart = '#FDA4AF';
            colorEnd = '#BE123C';
          } else if (p.type === 'saffron') {
            colorStart = '#FED7AA';
            colorEnd = '#C2410C';
          }

          const petalGrad = ctx.createLinearGradient(0, -p.size, 0, p.size);
          petalGrad.addColorStop(0, colorStart);
          petalGrad.addColorStop(1, colorEnd);

          ctx.fillStyle = petalGrad;

          // Teardrop / rounded petal geometry
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.4, p.size * 0.7, p.size * 0.6, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.6, -p.size * 0.7, -p.size * 0.4, 0, -p.size);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [initParticles, reducedMotion]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#0A0214] ${className}`}
      aria-hidden="true"
    >
      {/* ──────────────────────────────────────────────────────────────────────
          LAYER 1: BACKGROUND SKY, DIVINE LIGHT RAYS & DEEP AURA
         ────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallax.x * 0.3}px, ${parallax.y * 0.3}px, 0)`,
        }}
      >
        {/* Deep Sanctum Night Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070114] via-[#160527] to-[#0A0214]" />

        {/* Ambient Sanctum Dawn Horizon Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-600/20 via-orange-600/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-purple-950/40 via-amber-950/20 to-transparent" />

        {/* Volumetric Rotating Divine God Rays */}
        {intensity !== 'low' && (
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1200px] h-[800px] sm:h-[1200px] opacity-15 sm:opacity-20 pointer-events-none">
            <div className={reducedMotion ? '' : 'animate-stage-ray-spin'}>
              <svg viewBox="0 0 1000 1000" fill="none" className="w-full h-full">
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12;
                  return (
                    <polygon
                      key={i}
                      points="500,500 480,0 520,0"
                      fill="url(#godRayGrad)"
                      transform={`rotate(${angle} 500 500)`}
                    />
                  );
                })}
                <defs>
                  <linearGradient id="godRayGrad" x1="500" y1="500" x2="500" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          LAYER 2: STAGE ARCHITECTURE (MANDAP ARCH, PILLARS & RANGOLI)
         ────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallax.x * 0.6}px, ${parallax.y * 0.6}px, 0)`,
        }}
      >
        <MandapArchitecture reducedMotion={reducedMotion} intensity={intensity} />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          LAYER 3: DECORATIVE LIGHTS (FAIRY LIGHTS, BELLS, PEDESTAL DIYAS)
         ────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallax.x * 0.8}px, ${parallax.y * 0.8}px, 0)`,
        }}
      >
        <FestiveLights reducedMotion={reducedMotion} intensity={intensity} />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          LAYER 4: FLOWER GARLANDS (MARIGOLD TORANS & JASMINE STRINGS)
         ────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallax.x * 0.9}px, ${parallax.y * 0.9}px, 0)`,
        }}
      >
        <FlowerGarlands reducedMotion={reducedMotion} intensity={intensity} />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          LAYER 5: FOREGROUND ATMOSPHERIC PARTICLES CANVAS ENGINE
         ────────────────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-30"
      />

      {/* ──────────────────────────────────────────────────────────────────────
          READABILITY SCRIM / VIGNETTE (CRITICAL FOR UI HIGH CONTRAST)
         ────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-35 bg-gradient-radial from-transparent via-[#0E021C]/45 to-[#0E021C]/85"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(14,2,28,0.25) 0%, rgba(14,2,28,0.65) 60%, rgba(14,2,28,0.88) 100%)',
        }}
      />

      {/* Optional Children Layer (e.g., custom screen accents) */}
      {children}
    </div>
  );
};

export default UtsavStage;
