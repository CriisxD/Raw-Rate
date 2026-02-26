'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import './landing.css';

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create grid particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 26, 74, ${p.opacity})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 26, 74, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleStart = () => {
    // Create session ID
    if (!localStorage.getItem('rawrate_session')) {
      localStorage.setItem('rawrate_session', crypto.randomUUID());
    }
    router.push('/upload');
  };

  return (
    <main className="landing">
      <canvas ref={canvasRef} className="landing-canvas" />

      <div className="landing-gradient-orb landing-gradient-orb-1" />
      <div className="landing-gradient-orb landing-gradient-orb-2" />

      <div className="landing-content container">
        <div className="landing-badge animate-fade-in">
          <span className="landing-badge-dot" />
          <span>ANÁLISIS ANTROPOMÉTRICO v3.2</span>
        </div>

        <h1 className="heading-xl animate-fade-in delay-1">
          Descubre tu<br />
          <span className="text-gradient">nivel real.</span>
        </h1>

        <p className="landing-subtitle animate-fade-in delay-2">
          Sin filtros. Sin mentiras.<br />
          Análisis biométrico potenciado por IA.
        </p>

        <button className="btn-primary landing-cta animate-fade-in delay-3" onClick={handleStart}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Iniciar Escáner
        </button>

        <div className="landing-stats animate-fade-in delay-4">
          <div className="landing-stat">
            <span className="landing-stat-num">14.2K</span>
            <span className="landing-stat-label">escaneos hoy</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">6.4</span>
            <span className="landing-stat-label">score promedio</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">92%</span>
            <span className="landing-stat-label">precisión</span>
          </div>
        </div>

        <p className="landing-disclaimer animate-fade-in delay-5">
          Al continuar, aceptas someterte a un análisis objetivo y sin censura de tu apariencia física.<br/>
          <a href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'underline', marginRight: '1rem', fontSize: '0.8rem' }}>Términos de Servicio</a>
          <a href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'underline', fontSize: '0.8rem' }}>Política de Privacidad</a>
        </p>
      </div>
    </main>
  );
}
