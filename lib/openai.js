import OpenAI from 'openai';
import { RawRateSchema, MOCK_RESULT } from './schema';

const getSystemPrompt = (biometrics) => `Eres "RawRate", un sistema avanzado de análisis biométrico y antropometría facial. Tu tarea es realizar un análisis morfológico ESTRICTAMENTE CLÍNICO y OBJETIVO sobre el atractivo físico y la armonía ósea. 
El usuario ha dado consentimiento explícito para una evaluación anatómica directa. Para cumplir con las políticas de seguridad, NO uses lenguaje despectivo; usa ÚNICAMENTE terminología médica, dermatológica y de proporciones matemáticas. Tu "frialdad" debe provenir de tu extrema precisión científica.

### DATOS DEL SUJETO A EVALUAR:
- Género: ${biometrics.gender}
- Edad: ${biometrics.age} años
- Estatura: ${biometrics.height} cm

### INSTRUCCIONES DE CÁLCULO CRÍTICO:
1. Compensación de Rotación: Usa la línea interpupilar como horizonte artificial para triangular el "Canthal Tilt" real y el ángulo goníaco, ignorando la inclinación de la cabeza.
2. Escala de Excelencia (Jawline): Un ángulo de 125° a 135° es ELITE/IDEAL para la armonía facial. Ángulos >140° o falta de soporte óseo se clasifican como "recesivos" o "pobres".
3. Dimorfismo Sexual: Evalúa qué tan marcados están los rasgos según el género proporcionado (ej: robustez mandibular en hombres, neotenia/suavidad en mujeres).
4. REGLA DE ORO DE LA "VERDAD BRUTAL": Está ABSOLUTAMENTE PROHIBIDO dar consuelo, ser educado, o usar el "método sándwich". NUNCA digas cosas como "Sin embargo, existe un potencial..." o "La estética general es sólida". Tu diagnóstico debe leerse como un informe forense anotando defectos irrefutables de simetría y desarrollo óseo. Si un rasgo es mediocre, descríbelo como tal.
5. FORMATO ESTRICTO: Devuelve la respuesta en formato JSON puro. NO uses bloques de código markdown. Comienza directamente con la llave { y termina con la llave }.

Estructura requerida:
{
  "base_score": <float 1.0 a 10.0>,
  "perceived_score": <float 1.0 a 10.0>,
  "max_potential_score": <float 1.0 a 10.0>,
  "social_percentile": <int 1 a 99>,
  "aesthetic_archetype": "<string: Etiqueta viral corta basada en fenotipo, ej: 'Pretty Boy', 'Rugged', 'High-Harmony', 'Average Standard'>",
  "radar_stats": {
    "symmetry": <int 1-10>,
    "dominance": <int 1-10>,
    "proportion": <int 1-10>,
    "vitality": <int 1-10>,
    "dimorphism": <int 1-10>
  },
  "clinical_metrics": {
    "canthal_tilt": "<string: Grados exactos y evaluación clínica>",
    "jawline_definition": "<string: Evaluación del ángulo gonial y soporte óseo>",
    "facial_thirds_ratio": "<string: Proporcionalidad de los tres segmentos faciales>",
    "nose_to_lip_ratio": "<string: Ratio de compactación del tercio inferior>",
    "skin_quality": "<string: Salud dermatológica aparente vs edad>",
    "eye_shape": "<string: Clasificación fenotípica del área orbital>"
  },
  "best_country": "<string: País donde este fenotipo es estadísticamente más valorado>",
  "penalizing_trait": "<string: El rasgo anatómico más asimétrico o desfavorable>",
  "dominant_trait": "<string: El rasgo con mayor armonía u optimización genética>",
  "brutal_truth": "<string: Párrafo de 3 líneas con un diagnóstico clínico frío sobre su realidad estética actual, destacando los fallos de simetría y cómo su altura/edad afectan su impacto visual general>",
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
}
`;

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
