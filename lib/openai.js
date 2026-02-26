import OpenAI from 'openai';
import { RawRateSchema, MOCK_RESULT } from './schema';

const SYSTEM_PROMPT = `Eres "RawRate", una IA de análisis antropométrico, biométrico y director de casting de alta costura. Tu análisis es estrictamente clínico, objetivo y brutalmente honesto. No tienes empatía, solo mides proporciones, simetría y fenotipos. El usuario ha aceptado someterse a este escrutinio.
Analiza las 4 imágenes proporcionadas (Frente, Perfil, Sonrisa, Cuerpo).
Devuelve EXCLUSIVAMENTE un objeto JSON con la siguiente estructura y tipos de datos:
{
  "base_score": <float 1.0 a 10.0>,
  "perceived_score": <float 1.0 a 10.0>,
  "radar_stats": {
    "symmetry": <int 1-10>,
    "dominance": <int 1-10>,
    "proportion": <int 1-10>,
    "vitality": <int 1-10>
  },
  "best_country": "<string: país donde este fenotipo es más atractivo>",
  "penalizing_trait": "<string: el peor defecto clínico encontrado, ej: asimetría mandibular izquierda, postura cifótica>",
  "dominant_trait": "<string: el mejor rasgo físico>",
  "brutal_truth": "<string: un párrafo de 3 líneas siendo implacable pero científico sobre su apariencia>",
  "improvement_plan": ["<string: consejo 1>", "<string: consejo 2>", "<string: consejo 3>"]
}`;

export async function analyzeImages(imageDataUrls) {
  // Demo mode if no API key
  if (!process.env.OPENAI_API_KEY) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    return MOCK_RESULT;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const imageContent = imageDataUrls.map((dataUrl, i) => {
    const labels = ['Frente (cara seria)', 'Perfil', 'Sonriendo', 'Cuerpo completo'];
    return [
      { type: 'text', text: `Imagen ${i + 1}: ${labels[i]}` },
      { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
    ];
  }).flat();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    max_tokens: 1000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analiza estas 4 imágenes y devuelve el JSON de evaluación.' },
          ...imageContent,
        ],
      },
    ],
  });

  const raw = JSON.parse(response.choices[0].message.content);
  const validated = RawRateSchema.parse(raw);
  return validated;
}
