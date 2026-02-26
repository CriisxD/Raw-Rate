'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './dashboard.css';

function RadarChart({ stats, onExplain }) {
  if (!stats) return null;
  const labels = ['Simetría', 'Dominancia', 'Proporción', 'Vitalidad', 'Dimorfismo'];
  const keys = ['symmetry', 'dominance', 'proportion', 'vitality', 'dimorphism'];
  const cx = 150, cy = 150, r = 100; // Expanded center
  const angles = keys.map((_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2); // 5 points

  const outerPoints = angles.map(a => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(' ');
  const midPoints = angles.map(a => `${cx + r * 0.6 * Math.cos(a)},${cy + r * 0.6 * Math.sin(a)}`).join(' ');
  const innerPoints = angles.map(a => `${cx + r * 0.3 * Math.cos(a)},${cy + r * 0.3 * Math.sin(a)}`).join(' ');

  const dataPoints = keys.map((k, i) => {
    const val = (stats[k] || 5) / 10;
    return `${cx + r * val * Math.cos(angles[i])},${cy + r * val * Math.sin(angles[i])}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 300 300" className="radar-svg" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <polygon points={outerPoints} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <polygon points={midPoints} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <polygon points={innerPoints} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <polygon points={dataPoints} fill="rgba(255,26,74,0.15)" stroke="var(--red)" strokeWidth="2" />
      {keys.map((k, i) => {
        // Push labels further out
        const textOffset = 28;
        const lx = cx + (r + textOffset) * Math.cos(angles[i]);
        const ly = cy + (r + textOffset) * Math.sin(angles[i]);
        return (
          <g key={k}>
            <circle cx={cx + r * ((stats[k]||5)/10) * Math.cos(angles[i])}
              cy={cy + r * ((stats[k]||5)/10) * Math.sin(angles[i])} r="4" fill="var(--red)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
              fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)"
              style={{ cursor: 'pointer' }}
              onClick={() => onExplain && onExplain(keys[i], labels[i])}>
              {labels[i]} (?)
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

const EXPLANATIONS = {
  canthal_tilt: "Ángulo entre el canto interno y externo del ojo. Un ángulo positivo suele asociarse con rostros más atractivos y dominantes.",
  jawline_definition: "Nitidez y ángulo del hueso mandibular. Ángulos entre 125°-135° con soporte óseo fuerte son el estándar de oro estético.",
  facial_thirds_ratio: "Proporción vertical de la frente, nariz y mentón. La perfecta simetría 1:1:1 es la base de la armonía facial canónica.",
  nose_to_lip_ratio: "Distancia entre la nariz y el labio superior (philtrum). Un philtrum corto es indicador de compactación maxilar y juventud.",
  eye_shape: "Morfología ósea orbitaria. 'Hunter eyes' (almendrados profundos) denotan alta presencia genética.",
  skin_quality: "Micro-textura y claridad dérmica. Refleja directamente marcadores biológicos de vitalidad sistémica.",
  symmetry: "Precisión de reflejo entre el lado izquierdo y derecho del rostro. Indicador primario de estabilidad genética.",
  dominance: "Robustez morfológica general que proyecta autoridad espacial y genética.",
  proportion: "Relaciones matemáticas (áureas) entre anchos y altos faciales relativos.",
  vitality: "Ausencia de signos de envejecimiento prematuro, desgaste o asimetrías inducidas por el entorno.",
  dimorphism: "Diferenciación sexual: hiper-masculinización de la estructura ósea en varones o neotenia/feminización de tejidos blandos en mujeres."
};

function HelpIcon({ paramKey, title, onExplain }) {
  return (
    <span 
      onClick={() => onExplain(paramKey, title)}
      style={{ marginLeft: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px', borderRadius: '50%', border: '1px solid var(--text-muted)', fontSize: '9px', color: 'var(--text-muted)', verticalAlign: 'middle' }}>
      ?
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [explanation, setExplanation] = useState(null);
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
      ctx.font = '700 40px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RAWRATE', 540, 250);

      ctx.fillStyle = 'rgba(240,240,245,0.7)';
      ctx.font = '400 32px Inter, sans-serif';
      ctx.letterSpacing = '10px';
      ctx.fillText('TARJETA DE FENOTIPO', 540, 320);

      // Score
      ctx.fillStyle = '#f0f0f5';
      ctx.font = '900 240px Inter, sans-serif';
      ctx.fillText(`${data.base_score?.toFixed(1)}`, 540, 750);

      ctx.fillStyle = 'rgba(240,240,245,0.4)';
      ctx.font = '400 50px Inter, sans-serif';
      ctx.fillText('PUNTAJE CLÍNICO / 10', 540, 850);

      // Archetype (Virality booster)
      if (data.aesthetic_archetype) {
        ctx.fillStyle = '#00f0ff';
        ctx.font = '800 54px Inter, sans-serif';
        ctx.fillText(`"${data.aesthetic_archetype.toUpperCase()}"`, 540, 1050);
        
        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.font = '400 30px Inter, sans-serif';
        ctx.fillText('ARQUETIPO DETECTADO', 540, 1110);
      }

      // Best Country
      if (data.best_country) {
        ctx.fillStyle = '#b800ff';
        ctx.font = '800 54px Inter, sans-serif';
        ctx.fillText(`🌍 ${data.best_country.toUpperCase()}`, 540, 1280);

        ctx.fillStyle = 'rgba(184, 0, 255, 0.6)';
        ctx.font = '400 30px Inter, sans-serif';
        ctx.fillText('TOP 5% DE ATRACCIÓN EN:', 540, 1220);
      }

      // Tag
      ctx.fillStyle = '#ff1a4a';
      ctx.font = '700 36px Inter, sans-serif';
      ctx.fillText('La IA de RawRate me destruyó la autoestima.', 540, 1500);

      ctx.fillStyle = 'rgba(240,240,245,0.5)';
      ctx.font = '400 28px Inter, sans-serif';
      ctx.fillText('¿Te atreves a escanear tu rostro?', 540, 1560);

      // URL
      ctx.fillStyle = 'rgba(240,240,245,0.3)';
      ctx.font = '400 24px Inter, sans-serif';
      ctx.fillText('rawrate.app', 540, 1800);

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
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🚩</span>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', letterSpacing: '0.1em', margin: 0, background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            RAWRATE
          </h1>
        </div>

        <div className="dash-header">
          <span className="text-mono">REPORTE COMPLETO</span>
          <span className="text-mono" style={{ color: 'var(--cyan)' }}>#{id.slice(0, 8)}</span>
        </div>

        {/* Score Section */}
        <div className="dash-score-section">
          <span className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ATRACTIVO BASE</span>
          <AnimatedScore value={data.base_score || 0} />
          <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>/10</span>
          <div className="dash-perceived">
            <span>Percepción social: </span>
            <strong style={{ color: 'var(--cyan)' }}>{data.perceived_score?.toFixed(1)}</strong>
          </div>
          <div style={{ marginTop: '0.5rem', background: 'rgba(184, 0, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', display: 'inline-block', border: '1px solid rgba(184, 0, 255, 0.2)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>POTENCIAL MÁXIMO: </span>
            <strong style={{ color: 'var(--purple)', fontSize: '1.1rem' }}>{data.max_potential_score?.toFixed(1)}</strong>
          </div>
        </div>

        {/* Aesthetic Archetype */}
        {data.aesthetic_archetype && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ 
              display: 'inline-block', 
              background: 'rgba(0, 240, 255, 0.1)', 
              color: 'var(--cyan)', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.85rem',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)'
            }}>
              ARQUETIPO: {data.aesthetic_archetype.toUpperCase()}
            </span>
          </div>
        )}

        {/* Radar Chart */}
        <div className="dash-section">
          <h3 className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Métricas Biométricas <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Toca para explicar)</span>
          </h3>
          <div className="radar-container" style={{ width: '260px', height: '260px' }}>
            <RadarChart stats={data.radar_stats} onExplain={(k, t) => setExplanation({ title: t, text: EXPLANATIONS[k] })} />
          </div>
        </div>

        {/* Desglose Clinico */}
        {data.clinical_metrics && (
          <div className="dash-section">
            <h3 className="dash-section-title">
              <span style={{ color: 'var(--cyan)' }}>🔬</span> Desglose Clínico
            </h3>
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inclinación Cantal <HelpIcon paramKey="canthal_tilt" title="Inclinación Cantal" onExplain={(k, t) => setExplanation({ title: t, text: EXPLANATIONS[k] })}/></span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{data.clinical_metrics.canthal_tilt}</p>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Definición Mandibular <HelpIcon paramKey="jawline_definition" title="Definición Mandibular" onExplain={(k, t) => setExplanation({ title: t, text: EXPLANATIONS[k] })}/></span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{data.clinical_metrics.jawline_definition}</p>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tercios Faciales <HelpIcon paramKey="facial_thirds_ratio" title="Tercios Faciales" onExplain={(k, t) => setExplanation({ title: t, text: EXPLANATIONS[k] })}/></span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{data.clinical_metrics.facial_thirds_ratio}</p>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ratio Nariz-Labio <HelpIcon paramKey="nose_to_lip_ratio" title="Ratio Nariz-Labio" onExplain={(k, t) => setExplanation({ title: t, text: EXPLANATIONS[k] })}/></span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{data.clinical_metrics.nose_to_lip_ratio}</p>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fenotipo Ocular <HelpIcon paramKey="eye_shape" title="Fenotipo Ocular" onExplain={(k, t) => setExplanation({ title: t, text: EXPLANATIONS[k] })}/></span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{data.clinical_metrics.eye_shape}</p>
              </div>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Calidad Dérmica <HelpIcon paramKey="skin_quality" title="Calidad Dérmica" onExplain={(k, t) => setExplanation({ title: t, text: EXPLANATIONS[k] })}/></span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{data.clinical_metrics.skin_quality}</p>
              </div>
            </div>
          </div>
        )}

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

        {/* Comparativo Social */}
        <div className="dash-section">
          <h3 className="dash-section-title">
            <span style={{ color: 'var(--cyan)' }}>👥</span> Comparativo Social
          </h3>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>
              Más atractivo que el <strong style={{ color: 'var(--cyan)', fontSize: '1.3rem' }}>{data.social_percentile}%</strong> de la población en tu rango etario.
            </p>
            <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${data.social_percentile}%`, background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)' }} />
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              * Basado en distribución de fenotipos observados clínicamente en {data.best_country}.
            </p>
          </div>
        </div>

        {/* Improvement Plan */}
        {data.improvement_plan && data.improvement_plan.length > 0 && (
          <div className="dash-section">
            <h3 className="dash-section-title">
              <span style={{ color: 'var(--cyan)' }}>🩺</span> Protocolo Clínico (30 Días)
              {!data.has_upsell && <span className="dash-locked-badge">BLOQUEADO</span>}
            </h3>
            <div className={`dash-plan-premium ${!data.has_upsell ? 'locked' : ''}`}>
              {data.improvement_plan.map((step, i) => (
                <div key={i} className="premium-plan-card glass-card">
                  <div className="premium-plan-header">
                    <span className="premium-plan-num">Fase {i + 1}</span>
                    <h4 className="premium-plan-focus">{typeof step === 'string' ? 'Recomendación' : step.focus}</h4>
                  </div>
                  {typeof step === 'object' ? (
                    <>
                      <div className="premium-plan-target">
                        <span className="text-muted-xs">OBJETIVO:</span> {step.target_metric}
                      </div>
                      <div className="premium-plan-protocol">
                        <span className="text-muted-xs">PROTOCOLO:</span>
                        <p>{data.has_upsell ? step.protocol : step.protocol.substring(0, 60) + '...'}</p>
                      </div>
                      {data.has_upsell && step.scientific_basis && (
                        <div className="premium-plan-science">
                          <span className="text-muted-xs">BASE CIENTÍFICA:</span>
                          <p>{step.scientific_basis}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>{data.has_upsell ? step : step.substring(0, 60) + '...'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Button */}
        <button className="btn-primary dash-share" onClick={handleShare}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Generar mi Tarjeta de Fenotipo
        </button>

        <button className="btn-secondary dash-restart" onClick={() => router.push('/')}>
          Escanear a otro →
        </button>

        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
            DISCLAIMER: Este es un reporte de optimización estética generado por IA. Resultados de protocolos sugieren cambios a nivel estadístico mundial y varían por genética. Consulte a un profesional de la salud antes de iniciar regímenes dermatológicos o de hipertrofia muscular. El puntaje no determina tu valor como persona.
          </p>
        </div>
      </div>
      {/* Explanation Modal */}
      {explanation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }} onClick={() => setExplanation(null)}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', border: '1px solid var(--cyan)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{explanation.title}</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--text-primary)' }}>{explanation.text}</p>
            <button className="btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setExplanation(null)}>Entendido</button>
          </div>
        </div>
      )}
    </main>
  );
}
