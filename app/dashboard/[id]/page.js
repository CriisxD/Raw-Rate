'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './dashboard.css';

function RadarChart({ stats }) {
  if (!stats) return null;
  const labels = ['Simetría', 'Dominancia', 'Proporción', 'Vitalidad'];
  const keys = ['symmetry', 'dominance', 'proportion', 'vitality'];
  const cx = 130, cy = 130, r = 100;
  const angles = keys.map((_, i) => (Math.PI * 2 * i) / 4 - Math.PI / 2);

  const outerPoints = angles.map(a => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(' ');
  const midPoints = angles.map(a => `${cx + r * 0.6 * Math.cos(a)},${cy + r * 0.6 * Math.sin(a)}`).join(' ');
  const innerPoints = angles.map(a => `${cx + r * 0.3 * Math.cos(a)},${cy + r * 0.3 * Math.sin(a)}`).join(' ');

  const dataPoints = keys.map((k, i) => {
    const val = (stats[k] || 5) / 10;
    return `${cx + r * val * Math.cos(angles[i])},${cy + r * val * Math.sin(angles[i])}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 260 260" className="radar-svg">
      <polygon points={outerPoints} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <polygon points={midPoints} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <polygon points={innerPoints} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <polygon points={dataPoints} fill="rgba(255,26,74,0.15)" stroke="var(--red)" strokeWidth="2" />
      {keys.map((k, i) => {
        const lx = cx + (r + 22) * Math.cos(angles[i]);
        const ly = cy + (r + 22) * Math.sin(angles[i]);
        return (
          <g key={k}>
            <circle cx={cx + r * ((stats[k]||5)/10) * Math.cos(angles[i])}
              cy={cy + r * ((stats[k]||5)/10) * Math.sin(angles[i])} r="4" fill="var(--red)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
              fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">
              {labels[i]}: {stats[k]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AnimatedScore({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(+(start + (end - start) * eased).toFixed(1));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [value]);
  return <span className="score-big">{display}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const shareRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/result/${id}?full=1`);
        const json = await res.json();
        setData(json);
      } catch {}
    }
    load();
  }, [id]);

  const handleShare = async () => {
    try {
      // Create share card using canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, '#07070d');
      gradient.addColorStop(0.5, '#1a0a15');
      gradient.addColorStop(1, '#07070d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,26,74,0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 1920; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
      }
      for (let i = 0; i < 1080; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1920); ctx.stroke();
      }

      // Title
      ctx.fillStyle = '#ff1a4a';
      ctx.font = '700 48px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RAWRATE', 540, 400);

      // Score
      ctx.fillStyle = '#f0f0f5';
      ctx.font = '900 200px Inter, sans-serif';
      ctx.fillText(`${data.base_score?.toFixed(1)}`, 540, 900);

      ctx.fillStyle = 'rgba(240,240,245,0.4)';
      ctx.font = '400 60px Inter, sans-serif';
      ctx.fillText('/10', 540, 980);

      // Tag
      ctx.fillStyle = '#ff1a4a';
      ctx.font = '700 36px Inter, sans-serif';
      ctx.fillText('La IA de RawRate me destruyó.', 540, 1200);

      ctx.fillStyle = 'rgba(240,240,245,0.5)';
      ctx.font = '400 28px Inter, sans-serif';
      ctx.fillText('¿Te atreves a descubrir tu score?', 540, 1260);

      // URL
      ctx.fillStyle = 'rgba(240,240,245,0.3)';
      ctx.font = '400 24px Inter, sans-serif';
      ctx.fillText('rawrate.app', 540, 1700);

      canvas.toBlob(async (blob) => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Mi score en RawRate',
              text: `La IA de RawRate me dio un ${data.base_score?.toFixed(1)}/10. ¿Te atreves?`,
              files: [new File([blob], 'rawrate-score.png', { type: 'image/png' })],
            });
          } catch {}
        } else {
          // Fallback: download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'rawrate-score.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  if (!data) {
    return (
      <main className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '40vh' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page page-enter">
      <div className="container">
        <div className="dash-header">
          <span className="text-mono">REPORTE COMPLETO</span>
          <span className="text-mono" style={{ color: 'var(--cyan)' }}>#{id.slice(0, 8)}</span>
        </div>

        {/* Score Section */}
        <div className="dash-score-section">
          <span className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TU SCORE FINAL</span>
          <AnimatedScore value={data.base_score || 0} />
          <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>/10</span>
          <div className="dash-perceived">
            <span>Score percibido: </span>
            <strong style={{ color: 'var(--cyan)' }}>{data.perceived_score?.toFixed(1)}</strong>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="dash-section">
          <h3 className="dash-section-title">Métricas Biométricas</h3>
          <div className="radar-container" style={{ width: '260px', height: '260px' }}>
            <RadarChart stats={data.radar_stats} />
          </div>
        </div>

        {/* Brutal Truth */}
        <div className="dash-section">
          <h3 className="dash-section-title">
            <span style={{ color: 'var(--red)' }}>⚡</span> La Verdad Brutal
          </h3>
          <div className="dash-truth glass-card">
            <p>{data.brutal_truth}</p>
          </div>
        </div>

        {/* Traits */}
        <div className="dash-traits">
          <div className="dash-trait-card">
            <span className="dash-trait-icon" style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--cyan)' }}>↑</span>
            <div>
              <span className="dash-trait-label">Rasgo Dominante</span>
              <p className="dash-trait-value">{data.dominant_trait}</p>
            </div>
          </div>
          <div className="dash-trait-card">
            <span className="dash-trait-icon" style={{ background: 'rgba(255,26,74,0.1)', color: 'var(--red)' }}>↓</span>
            <div>
              <span className="dash-trait-label">Rasgo Penalizante</span>
              <p className="dash-trait-value">{data.penalizing_trait}</p>
            </div>
          </div>
        </div>

        {/* Best Country */}
        <div className="dash-country glass-card">
          <span style={{ fontSize: '2rem' }}>🌍</span>
          <div>
            <span className="dash-trait-label">Tu País Ideal</span>
            <p className="heading-md" style={{ color: 'var(--cyan)' }}>
              Tu fenotipo es top 5% en <strong>{data.best_country}</strong>
            </p>
          </div>
        </div>

        {/* Improvement Plan */}
        {data.improvement_plan && data.improvement_plan.length > 0 && (
          <div className="dash-section">
            <h3 className="dash-section-title">
              <span style={{ color: 'var(--purple)' }}>📈</span> Plan de Acción
              {!data.has_upsell && <span className="dash-locked-badge">BLOQUEADO</span>}
            </h3>
            <div className={`dash-plan ${!data.has_upsell ? 'locked' : ''}`}>
              {data.improvement_plan.map((step, i) => (
                <div key={i} className="dash-plan-step">
                  <span className="dash-plan-num">{i + 1}</span>
                  <p>{data.has_upsell ? step : step.substring(0, 40) + '...'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Button */}
        <button className="btn-primary dash-share" onClick={handleShare}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Compartir en TikTok / Stories
        </button>

        <button className="btn-secondary dash-restart" onClick={() => router.push('/')}>
          Escanear a otro →
        </button>
      </div>
    </main>
  );
}
