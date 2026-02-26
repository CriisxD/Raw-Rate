'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './upsell.css';

export default function UpsellPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/result/${id}`);
        const json = await res.json();
        setData(json);
      } catch {}
    }
    load();
  }, [id]);

  const handleUpsell = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id, type: 'upsell' }),
      });
      const json = await res.json();
      if (json.checkoutUrl) {
        window.open(json.checkoutUrl, '_blank');
        const poll = setInterval(async () => {
          const sr = await fetch(`/api/result/${id}`);
          const sd = await sr.json();
          if (sd.has_upsell) {
            clearInterval(poll);
            router.push(`/dashboard/${id}`);
          }
        }, 3000);
      } else {
        router.push(`/dashboard/${id}`);
      }
    } catch {
      router.push(`/dashboard/${id}`);
    }
    setLoading(false);
  };

  const penalizing = data?.penalizing_trait || 'tu defecto estructural';

  return (
    <main className="upsell-page page-enter">
      <div className="container">
        {/* Success badge */}
        <div className="upsell-success">
          <div className="upsell-check">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="heading-lg" style={{ marginTop: '16px' }}>¡Reporte Desbloqueado!</h2>
          <p className="text-mono" style={{ marginTop: '8px' }}>Tu análisis completo está listo</p>
        </div>

        {/* Upsell offer */}
        <div className="upsell-card glass-card">
          <div className="upsell-badge-offer">OFERTA ÚNICA</div>

          <h3 className="heading-md" style={{ textAlign: 'center', marginBottom: '16px' }}>
            Plan de Mejora <span style={{ color: 'var(--cyan)' }}>30 Días</span>
          </h3>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            La IA generará una rutina personalizada de 30 días para corregir tu
            <strong style={{ color: 'var(--red)' }}> {penalizing}</strong> y subir tu score a <strong style={{ color: 'var(--cyan)' }}>9.0+</strong>.
          </p>

          <div className="upsell-benefits">
            <div className="upsell-benefit">
              <span className="upsell-benefit-icon">🎯</span>
              <span>Plan personalizado basado en tu análisis</span>
            </div>
            <div className="upsell-benefit">
              <span className="upsell-benefit-icon">📈</span>
              <span>Resultados visibles en 2 semanas</span>
            </div>
            <div className="upsell-benefit">
              <span className="upsell-benefit-icon">🔬</span>
              <span>Basado en ciencia antropométrica</span>
            </div>
          </div>

          <div className="upsell-price">
            <span className="upsell-price-amount">$2.99</span>
            <span className="upsell-price-label">extra</span>
          </div>

          <button className="btn-primary upsell-buy" onClick={handleUpsell} disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Procesando...</>
            ) : (
              'Sí, quiero mejorar →'
            )}
          </button>
        </div>

        {/* Skip */}
        <button className="btn-secondary upsell-skip" onClick={() => router.push(`/dashboard/${id}`)}>
          No, ver mi reporte →
        </button>
      </div>
    </main>
  );
}
