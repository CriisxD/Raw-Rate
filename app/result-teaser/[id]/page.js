'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './result-teaser.css';

export default function ResultTeaserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [media, setMedia] = useState([]);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [resData, resMedia] = await Promise.all([
          fetch(`/api/result/${id}`),
          fetch(`/api/media/${id}`)
        ]);
        const jsonData = await resData.json();
        const jsonMedia = await resMedia.json();
        setData(jsonData);
        if (jsonMedia.images) {
          setMedia(jsonMedia.images);
        }
      } catch {}
    }
    load();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleUnlock = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id, type: 'base_report' }),
      });
      const json = await res.json();
      if (json.checkoutUrl) {
        window.open(json.checkoutUrl, '_blank');
        // Poll for unlock status
        const poll = setInterval(async () => {
          const statusRes = await fetch(`/api/result/${id}`);
          const statusData = await statusRes.json();
          if (statusData.is_unlocked) {
            clearInterval(poll);
            router.push(`/upsell/${id}`);
          }
        }, 3000);
      } else {
        // Demo mode: directly unlock
        router.push(`/upsell/${id}`);
      }
    } catch {
      // Demo mode fallback
      router.push(`/upsell/${id}`);
    }
    setCheckoutLoading(false);
  };

  if (!data) {
    return (
      <main className="teaser-page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '40vh' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </main>
    );
  }

  return (
    <main className="teaser-page page-enter">
      <div className="container">
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🚩</span>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', letterSpacing: '0.1em', margin: 0, background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            RAWRATE
          </h1>
        </div>

        {/* Timer */}
        <div className="teaser-timer">
          <div className="timer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {formatTime(timer)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Reporte eliminado por privacidad
          </span>
        </div>

        {/* User Images Grid / Scanning Effect */}
        {media && media.length > 0 && (
          <div className="teaser-media-grid">
            {media.map((img, i) => (
              <div key={i} className="teaser-media-item">
                <img src={img.data} alt={img.type} />
                <div className="teaser-scanner-overlay"></div>
              </div>
            ))}
          </div>
        )}

        {/* Classification badge */}
        <div className="teaser-classified">
          <span>◉ ANÁLISIS CLASIFICADO</span>
        </div>

        {/* Scores */}
        <div className="teaser-scores">
          <div className="teaser-score-card">
            <span className="teaser-score-label">ATRACTIVO BASE</span>
            <span className="teaser-score-value">{data.base_score?.toFixed(1)}</span>
            <span className="teaser-score-max">/10</span>
          </div>
          <div className="teaser-vs">vs</div>
          <div className="teaser-score-card highlight">
            <span className="teaser-score-label">PERCEPCIÓN SOCIAL</span>
            <span className="teaser-score-value">{data.perceived_score?.toFixed(1)}</span>
            <span className="teaser-score-max">/10</span>
          </div>
        </div>
        
        {/* Potencial Maximo */}
        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>POTENCIAL MÁXIMO ALCANZABLE: </span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--purple)', textShadow: '0 0 10px rgba(184, 0, 255, 0.4)' }}>
            {data.max_potential_score?.toFixed(1)}/10
          </span>
        </div>

        {/* Blurred radar */}
        <div className="teaser-radar-wrapper">
          <div className="teaser-radar-blur">
            <svg viewBox="0 0 200 200" width="200" height="200">
              <polygon points="100,20 170,70 150,160 50,160 30,70" fill="none" stroke="rgba(255,26,74,0.3)" strokeWidth="1"/>
              <polygon points="100,50 145,80 135,140 65,140 55,80" fill="rgba(255,26,74,0.1)" stroke="var(--red)" strokeWidth="2"/>
              <text x="100" y="15" textAnchor="middle" fill="var(--text-muted)" fontSize="8">SIM</text>
              <text x="180" y="75" textAnchor="start" fill="var(--text-muted)" fontSize="8">DOM</text>
              <text x="155" y="170" textAnchor="start" fill="var(--text-muted)" fontSize="8">PRO</text>
              <text x="45" y="170" textAnchor="end" fill="var(--text-muted)" fontSize="8">VIT</text>
            </svg>
          </div>
          <div className="teaser-radar-lock">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>DATOS BLOQUEADOS</span>
          </div>
        </div>

        <div className="teaser-copy glass-card">
          <p>
            Tienes un <strong style={{ color: 'var(--cyan)' }}>rasgo dominante</strong> que eleva tu atractivo
            {data.dominant_trait && <> — <em>{data.dominant_trait.substring(0, 50)}...</em></>},
            pero detectamos <strong style={{ color: 'var(--red)' }}>{data.penalizing_trait || 'un defecto estructural'}</strong> que te está hundiendo.
          </p>
          <p className="teaser-stat-line">
            Solo el <span className="text-gradient" style={{ fontWeight: 800 }}>{100 - (data.social_percentile || 86)}%</span> de la población tiene este perfil.
          </p>
        </div>

        {/* Technical Teaser */}
        <div className="teaser-technical glass-card" style={{ marginTop: '16px', marginBottom: '32px', border: '1px solid rgba(255,26,74,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Métrica Analizada</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--red)', fontWeight: 'bold' }}>ENCRIPTADO</span>
          </div>
          <p style={{ margin: '8px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
            Inclinación Cantal (Canthal Tilt)
          </p>
          <div style={{ background: 'rgba(255,26,74,0.1)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>[ DATO BLOQUEADO POR PAYWALL ]</span>
          </div>
        </div>

        {/* CTA */}
        <button
          className="btn-primary teaser-cta"
          onClick={handleUnlock}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? (
            <><span className="spinner" /> Procesando...</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Desbloquear Reporte Completo — $4.99
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '12px' }}>
          Pago seguro • Acceso instantáneo • Satisfacción garantizada
        </p>
      </div>
    </main>
  );
}
