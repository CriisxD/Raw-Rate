import './globals.css';

export const metadata = {
  title: 'RawRate — Descubre tu nivel real',
  description: 'Análisis antropométrico potenciado por IA. Sin filtros. Sin mentiras.',
  openGraph: {
    title: 'RawRate — ¿Cuál es tu score real?',
    description: 'La IA analizó mi cara. Resultado brutal.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
