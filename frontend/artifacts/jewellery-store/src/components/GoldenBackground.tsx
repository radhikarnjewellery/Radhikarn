import { useEffect, useRef } from 'react';

export function GoldenBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    let time = 0;
    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      // Draw a highly majestic, slow-moving bundle of golden ribbons (Liquid Gold Silk)
      const numLines = 80; // More threads for a richer silk texture
      
      for (let i = 0; i < numLines; i++) {
        ctx.beginPath();
        let pathStarted = false;
        
        // Spanning across the screen with higher resolution for smoother curves
        for (let x = -50; x <= w + 50; x += 10) {
          // Extremely complex, slow-shifting organic wave math
          const wave1 = Math.sin(x * 0.001 + time * 0.4 + i * 0.03) * (h * 0.25);
          const wave2 = Math.cos(x * 0.002 - time * 0.2 + i * 0.02) * (h * 0.15);
          const wave3 = Math.sin(x * 0.0005 + time * 0.15) * (h * 0.1);
          
          // Organic breathing expansion
          const spread = Math.sin(time * 0.5 + i * 0.1) * 3 + 6;
                        
          // Calculate final Y position
          const y = h * 0.5 + wave1 + wave2 + wave3 + (i - numLines / 2) * spread;

          if (!pathStarted) {
            ctx.moveTo(x, y);
            pathStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Deep contrast layering: Central threads glow brightly, outer threads fade deeply into the shadows
        const distanceToCore = Math.abs(i - numLines / 2);
        
        // Add shimmering effect by modulating opacity slightly with time
        const shimmer = Math.sin(time * 2 + i) * 0.03;
        const baseAlpha = Math.max(0, 0.25 - distanceToCore * 0.005);
        const alpha = baseAlpha + shimmer;
        
        ctx.strokeStyle = `rgba(212, 175, 55, ${Math.max(0, alpha)})`;
        ctx.lineWidth = distanceToCore < 10 ? 1 : 0.5; // Inner core is thicker, outer is whisper thin
        ctx.stroke();
      }

      // Dramatically slowed down time increment for ultra-majestic movement
      time += 0.003; 
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
      {/* Deep luxury vignettes and ambient static light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.06)_0%,transparent_50%),radial-gradient(circle_at_50%_100%,rgba(212,175,55,0.04)_0%,transparent_50%)]"></div>
      {/* The massive flowing silk canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
      {/* Vignette mask to fade the ribbons out beautifully at the screen edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050505_100%)]"></div>
    </div>
  );
}
