'use client';
import { useRouter } from 'next/navigation';
import '../landing.css';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <main className="landing page-enter" style={{ padding: 'var(--space-2xl) 0', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-glass)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)' }}>
        <button className="upload-back" onClick={() => router.push('/')} style={{ marginBottom: '2rem' }}>
          ← Volver
        </button>
        
        <h1 className="heading-xl" style={{ marginBottom: '2rem' }}>Política de Privacidad</h1>
        
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p><strong>Última actualización: Febrero 2026</strong></p>
          
          <h2 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Información que Recopilamos</h2>
          <p>Recopilamos las imágenes subidas por el usuario exclusivamente con el fin de realizar el análisis antropométrico. No compartimos sus fotos con terceros fuera de nuestros proveedores de inteligencia artificial y almacenamiento seguro.</p>
          
          <h2 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Procesamiento de Datos</h2>
          <p>Las imágenes son procesadas utilizando la API de OpenAI. Al usar nuestro servicio, usted acepta que las imágenes se envíen a OpenAI temporalmente para su análisis.</p>
          
          <h2 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Retención y Eliminación</h2>
          <p>No creamos cuentas de usuario ni guardamos datos personales. Los reportes generados se vinculan a un enlace anónimo temporal para que pueda visualizar su resultado. Usted puede solicitar la eliminación completa de su información y fotografías en cualquier momento contactando a nuestro soporte.</p>
          
          <h2 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Pagos Seguros</h2>
          <p>Todos los pagos son procesados a través de proveedores seguros (Lemon Squeezy / Stripe). RawRate no almacena ni tiene acceso a la información de su tarjeta de crédito.</p>
        </div>
      </div>
    </main>
  );
}
