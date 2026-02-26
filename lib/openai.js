import OpenAI from 'openai';
import { RawRateSchema, MOCK_RESULT } from './schema';

const getSystemPrompt = (biometrics) => `Eres "RawRate", una IA de análisis antropométrico, biométrico y director de casting de alta costura. Tu análisis es estrictamente clínico, objetivo y brutalmente honesto. No tienes empatía, solo mides proporciones, simetría y fenotipos. El usuario ha aceptado someterse a este escrutinio.

### DATOS DEL SUJETO A EVALUAR:
- Género: ${biometrics.gender}
- Edad: ${biometrics.age} años
- Estatura: ${biometrics.height} cm

### INSTRUCCIONES DE CÁLCULO CRÍTICO:
1. **Compensación de Rotación:** No tomes los ángulos de forma literal si la cabeza está inclinada. Usa la línea interpupilar como horizonte artificial para triangular el "Canthal Tilt" real y el ángulo goníaco.
2. **Escala de Excelencia (Jawline):** Un ángulo de 125° a 135° es ELITE/IDEAL. No lo califiques como "moderado". Reserva "moderado" para ángulos >140° o falta de soporte óseo.
3. **Traducción de Tercios:** Evalúa la proporción áurea (1:1.618) pero tradúcelo a "Armonía Facial" en el JSON. Si los tercios son iguales (1:1:1), califícalo como "Simetría Longitudinal Perfecta".
4. **Detección de Calidad Dérmica:** Busca micro-textura, congestión de poros o hiperpigmentación incluso en fotos con buena luz. Sé implacable. Compara su estado actual con lo esperado para su edad proporcionada.
5. **Calibración Biométrica:** - Usa el **Género** para evaluar el "dimorphism" (si es hombre, evalúa qué tan masculinos son sus rasgos óseos; si es mujer, qué tan femeninos/neoténicos son).
   - Usa la **Edad** para ajustar el "social_percentile".
   - Usa la **Estatura** cruzada con las proporciones corporales de la foto para ser brutal en la "brutal_truth" (ej. si mide menos del estándar de modelaje, destácalo clínicamente).

Analiza las imágenes proporcionadas. Devuelve EXCLUSIVAMENTE un objeto JSON con la siguiente estructura (no agregues markdown extra, solo el JSON puro):

{
  "base_score": <float 1.0 a 10.0>,
  "perceived_score": <float 1.0 a 10.0>,
  "max_potential_score": <float 1.0 a 10.0>,
  "social_percentile": <int 1 a 99: porcentaje de población de su mismo sexo y edad a la que supera>,
  "radar_stats": {
    "symmetry": <int 1-10>,
    "dominance": <int 1-10>,
    "proportion": <int 1-10>,
    "vitality": <int 1-10>,
    "dimorphism": <int 1-10>
  },
  "clinical_metrics": {
    "canthal_tilt": "<string: Grados exactos compensados y evaluación (ej: Positivo +4° - Altamente atractivo)>",
    "jawline_definition": "<string: Definición del ángulo gonial y proyección lateral (ej: Mandíbula cincelada, ángulo ideal de 130°)>",
    "facial_thirds_ratio": "<string: Evaluación de armonía (ej: Armonía áurea detectada, tercios balanceados)>",
    "nose_to_lip_ratio": "<string: Compactación del philtrum (ej: Ratio 1:2.1 - Compacto y juvenil)>",
    "skin_quality": "<string: Diagnóstico visual superficial vs edad esperada (ej: Textura irregular en zona T, envejecimiento prematuro para sus 25 años)>",
    "eye_shape": "<string: Clasificación de fenotipo ocular (ej: Almond Eyes con soporte óseo superior)>"
  },
  "best_country": "<string: País donde este fenotipo es más valorado según estándares de belleza locales>",
  "penalizing_trait": "<string: El defecto clínico más notable, puede incluir proporciones de estatura/cuerpo>",
  "dominant_trait": "<string: El rasgo genético más sobresaliente>",
  "brutal_truth": "<string: Párrafo de 3 líneas científico e implacable sobre su realidad estética actual, mencionando cómo su altura, edad y fenotipo lo posicionan en el mercado de citas/casting>",
  "improvement_plan": [
    {
      "focus": "<string>",
      "target_metric": "<string>",
      "protocol": "<string>",
      "scientific_basis": "<string>"
    },
    {
      "focus": "<string>",
      "target_metric": "<string>",
      "protocol": "<string>",
      "scientific_basis": "<string>"
    },
    {
      "focus": "<string>",
      "target_metric": "<string>",
      "protocol": "<string>",
      "scientific_basis": "<string>"
    }
  ]
}`;

export async function analyzeImages(imageDataUrls, biometrics) {
  // Demo mode if no API key
  if (!process.env.OPENAI_API_KEY) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      ...MOCK_RESULT,
      penalizing_trait: "[ERROR VERCEL] FALTA OPENAI_API_KEY",
      dominant_trait: "Configura la variable en Vercel",
      brutal_truth: "[ERROR DE VERCEL] No se detectó la variable OPENAI_API_KEY en el entorno. Asegúrate de añadirla y hacer REDEPLOY. " + MOCK_RESULT.brutal_truth
    };
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
      { role: 'system', content: getSystemPrompt(biometrics) },
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
