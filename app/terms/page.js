'use client';
import { useRouter } from 'next/navigation';
import '../page.css'; 

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="landing page-enter" style={{ padding: 'var(--space-2xl) 0', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-glass)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)' }}>
        <button className="upload-back" onClick={() => router.push('/')} style={{ marginBottom: '2rem' }}>
          ← Volver
        </button>
        
        <h1 className="heading-xl" style={{ marginBottom: '2rem' }}>Términos de Servicio</h1>
        
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p><strong>Última actualización: Febrero 2026</strong></p>
          
          <h2 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Naturaleza del Servicio</h2>
          <p>RawRate es una herramienta de entretenimiento y análisis basada en Inteligencia Artificial. Los puntajes, métricas clínicas y comentarios proporcionados ("La Verdad Brutal") son generados por un algoritmo automatizado. No constituyen consejo médico, psicológico, ni diagnóstico oficial.</p>
          
          <h2 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Consentimiento</h2>
          <p>Al utilizar este servicio y subir sus fotografías, usted acepta recibir un análisis objetivo que utiliza lenguaje fuerte o descriptivo sobre su apariencia física ("rasgos penalizantes", etc.). Si es sensible a comentarios sobre su imagen, le recomendamos no utilizar la aplicación.</p>
          
          <h2 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Edad Mínima</h2>
          <p>Debe ser mayor de edad en su jurisdicción para utilizar los servicios de pago ofrecidos por RawRate. No recopilamos conscientemente información de menores.</p>
          
          <h2 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Pagos y Reembolsos</h2>
          <p>Al adquirir un reporte completo o el Plan de Mejora Premium, usted recibe acceso inmediato al contenido digital. Dada la naturaleza de los bienes digitales instantáneos, no se ofrecen reembolsos una vez que el análisis ha sido entregado, salvo fallas técnicas comprobables del sistema.</p>
        </div>
      </div>
    </main>
  );
}
