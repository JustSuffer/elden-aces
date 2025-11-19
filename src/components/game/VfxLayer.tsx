import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface VfxLayerProps {
  effects: VfxEffect[];
}

export interface VfxEffect {
  type: "gamma" | "twisted" | "delta-sigma-transform";
  x: number;
  y: number;
  id: string;
}

export function VfxLayer({ effects }: VfxLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    effects.forEach((effect) => {
      spawnEffect(effect);
    });
  }, [effects]);

  const spawnEffect = (effect: VfxEffect) => {
    const particles = particlesRef.current;

    if (effect.type === "gamma") {
      // Golden particles rising up
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: effect.x + (Math.random() - 0.5) * 50,
          y: effect.y,
          vx: (Math.random() - 0.5) * 2,
          vy: -2 - Math.random() * 2,
          life: 0.8,
          maxLife: 0.8,
          size: 3 + Math.random() * 4,
          color: "hsl(45, 100%, 60%)",
        });
      }
    } else if (effect.type === "twisted") {
      // Reflection waves
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        particles.push({
          x: effect.x,
          y: effect.y,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 0.9,
          maxLife: 0.9,
          size: 2,
          color: "hsl(280, 80%, 60%)",
        });
      }
    } else if (effect.type === "delta-sigma-transform") {
      // Transformation sparks
      for (let i = 0; i < 25; i++) {
        particles.push({
          x: effect.x,
          y: effect.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 0.7,
          maxLife: 0.7,
          size: 2 + Math.random() * 3,
          color: `hsl(${Math.random() * 60 + 180}, 70%, 60%)`,
        });
      }
    }

    animate();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= 0.016;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity

      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color.replace(")", `, ${alpha})`).replace("hsl", "hsla");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (particles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
