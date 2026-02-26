'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './processing.css';

const STAGES = [
  { text: 'Mapeando topología facial 3D', duration: 4000 },
  { text: 'Calculando proyección maxilar y asimetría cantal', duration: 4000 },
  { text: 'Evaluando fenotipo y cruzando con base de datos global', duration: 4000 },
  { text: 'Generando reporte de honestidad brutal', duration: 3000 },
];

export default function ProcessingPage() {
  const router = useRouter();
  const { id } = useParams();
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const [ready, setReady] = useState(false);
  const [minTimeReached, setMinTimeReached] = useState(false);
  const frontImg = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      frontImg.current = localStorage.getItem('rawrate_front_img');
    }
  }, []);

  // Stage progression
  useEffect(() => {
    let elapsed = 0;
    const totalDuration = STAGES.reduce((a, s) => a + s.duration, 0);

    const interval = setInterval(() => {
      elapsed += 100;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);

      let acc = 0;
      for (let i = 0; i < STAGES.length; i++) {
        acc += STAGES[i].duration;
        if (elapsed < acc) { setStageIndex(i); break; }
        if (i === STAGES.length - 1) setStageIndex(i);
      }

      if (elapsed >= totalDuration) {
        setMinTimeReached(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Dots animation
  useEffect(() => {
    const i = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(i);
  }, []);

  // Poll status
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        const data = await res.json();
        if (data.status === 'completed') {
          setReady(true);
          clearInterval(poll);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(poll);
  }, [id]);

  // Navigate when both ready and min time reached
  useEffect(() => {
    if (ready && minTimeReached) {
      router.push(`/result-teaser/${id}`);
    }
  }, [ready, minTimeReached, id, router]);

  return (
    <main className="processing-page">
      {/* Background image */}
      {frontImg.current && (
        <div className="processing-bg">
          <img src={frontImg.current} alt="" />
        </div>
      )}

      <div className="processing-overlay" />

      <div className="processing-content container">
        {/* Scan animation */}
        <div className="processing-scanner">
          <div className="scanner-ring ring-1" />
          <div className="scanner-ring ring-2" />
          <div className="scanner-ring ring-3" />
          <div className="scanner-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        </div>

        {/* Console output */}
        <div className="processing-console">
          {STAGES.map((stage, i) => (
            <div
              key={i}
              className={`console-line ${i < stageIndex ? 'done' : i === stageIndex ? 'active' : 'pending'}`}
            >
              <span className="console-prefix">
                {i < stageIndex ? '✓' : i === stageIndex ? '▶' : '○'}
              </span>
              <span className="console-text">
                {stage.text}{i === stageIndex ? dots : i < stageIndex ? '' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="processing-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-mono" style={{ fontSize: '0.75rem' }}>
            {Math.round(progress)}% COMPLETADO
          </span>
        </div>
      </div>
    </main>
  );
}
