'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './upload.css';

const STEPS = [
  { key: 'front', label: 'Frontal', desc: 'Cara seria, mirando directo a cámara', icon: '🎯' },
  { key: 'profile', label: 'Perfil', desc: 'Gira 90° hacia tu derecha', icon: '👤' },
  { key: 'smile', label: 'Sonrisa', desc: 'Sonrisa natural, ojos abiertos', icon: '😊' },
  { key: 'body', label: 'Cuerpo', desc: 'Cuerpo completo, postura natural', icon: '🧍' },
];

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400; // Drastically reduced for Vercel 4.5MB payload limit
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Lower quality to bypass limit
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const compressed = await compressImage(file);
    const step = STEPS[currentStep];
    setImages(prev => ({ ...prev, [step.key]: compressed }));
    if (currentStep < 3) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 500);
    }
  }, [currentStep]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('rawrate_session') || crypto.randomUUID();
      localStorage.setItem('rawrate_session', sessionId);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          images: {
            front: images.front,
            profile: images.profile,
            smile: images.smile,
            body: images.body,
          },
        }),
      });

      const data = await res.json();
      if (data.id) {
        // Store front image for processing page
        localStorage.setItem('rawrate_front_img', images.front);
        router.push(`/processing/${data.id}`);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const allUploaded = STEPS.every(s => images[s.key]);
  const step = STEPS[currentStep];

  return (
    <main className="upload-page page-enter">
      <div className="container">
        <div className="upload-header">
          <button className="upload-back" onClick={() => router.push('/')}>
            ← Volver
          </button>
          <span className="text-mono">PASO {currentStep + 1} DE 4</span>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className={`stepper-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`} />
              {i < 3 && <div className="stepper-line" />}
            </div>
          ))}
        </div>

        <h2 className="heading-lg" style={{ textAlign: 'center', marginBottom: '8px' }}>
          {step.icon} {step.label}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
          {step.desc}
        </p>

        {/* Upload zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} ${images[step.key] ? 'has-image' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {images[step.key] ? (
            <div className="upload-preview">
              <img src={images[step.key]} alt={step.label} />
              <div className="upload-preview-overlay">
                <span>✓ Capturado</span>
              </div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <p>Toca para subir o arrastra tu foto</p>
              <span className="text-mono" style={{ fontSize: '0.7rem' }}>JPG, PNG • Máx 10MB</span>
            </div>
          )}

          {/* Scanner overlay */}
          <div className="upload-scanner-line" />
          <div className="upload-corners">
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Thumbnails */}
        <div className="upload-thumbs">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              className={`upload-thumb ${i === currentStep ? 'active' : ''} ${images[s.key] ? 'filled' : ''}`}
              onClick={() => setCurrentStep(i)}
            >
              {images[s.key] ? (
                <img src={images[s.key]} alt={s.label} />
              ) : (
                <span>{s.icon}</span>
              )}
            </button>
          ))}
        </div>

        {/* Analyze button */}
        <button
          className="btn-primary upload-analyze"
          disabled={!allUploaded || loading}
          onClick={handleAnalyze}
          style={{ opacity: allUploaded ? 1 : 0.3 }}
        >
          {loading ? (
            <>
              <span className="spinner" /> Procesando...
            </>
          ) : (
            <>Analizar Ahora</>
          )}
        </button>
      </div>
    </main>
  );
}
