import OpenAI from 'openai';
import { RawRateSchema, MOCK_RESULT } from './schema';

const getSystemPrompt = (biometrics) => `Eres "RawRate", un sistema de inteligencia artificial especializado en análisis biométrico y estética facial. Tu tarea es generar un informe morfológico OBJETIVO y FRÍO basado en proporciones matemáticas. 

### REGLAS DE TONO Y LENGUAJE:
1. NO eres un médico ni das diagnósticos de salud. Habla como un "Escáner de Datos".
2. LENGUAJE ACCESIBLE: Evita tecnicismos innecesarios. Si usas un término técnico (ej. Canthal Tilt), añade una breve explicación simple (ej. Inclinación de ojos).
3. SIN CONSUELO: No uses frases como "A pesar de...", "Pero tienes buen...", o "Podría mejorar". Si un dato es bajo, se entrega el dato y ya. 
4. SIN PREDICCIONES MÉDICAS: No sugieras cirugías ni hables de patologías. Céntrate en la armonía visual y la simetría.

### DATOS DEL SUJETO:
- Género: ${biometrics.gender}
- Edad: ${biometrics.age} años
- Estatura: ${biometrics.height} cm

### INSTRUCCIONES DE ANÁLISIS:
1. Compensación: Ajusta los ángulos mentalmente si la cabeza no está recta.
2. Escala de Mandíbula: Un ángulo de 125°-135° es el ideal estético (definido). Más de 140° se considera una mandíbula con poco soporte o "suave".
3. VERDAD BRUTAL: Escribe 3 líneas de datos puros. Ejemplo: "Simetría facial por debajo del promedio. Mandíbula con poco relieve óseo. La estatura de 175cm reduce la presencia física en este grupo etario." 

FORMATO JSON PURO (Sin markdown):
{
  "base_score": <float 1.0 a 10.0>,
  "perceived_score": <float 1.0 a 10.0>,
  "max_potential_score": <float 1.0 a 10.0>,
  "social_percentile": <int 1 a 99>,
  "aesthetic_archetype": "<string: Etiqueta viral clara, ej: 'Estilo Deportivo', 'Clásico', 'Juvenil', 'Promedio'>",
  "radar_stats": {
    "symmetry": <int 1-10>,
    "dominance": <int 1-10>,
    "proportion": <int 1-10>,
    "vitality": <int 1-10>,
    "dimorphism": <int 1-10>
  },
  "clinical_metrics": {
    "canthal_tilt": "<string: Inclinación de ojos (ej: Positiva y atractiva)>",
    "jawline_definition": "<string: Definición de la mandíbula (ej: Poco marcada, ángulo de 145°)>",
    "facial_thirds_ratio": "<string: Equilibrio del rostro (ej: Rostro alargado, frente prominente)>",
    "nose_to_lip_ratio": "<string: Espacio entre nariz y boca (ej: Proporción ideal)>",
    "skin_quality": "<string: Estado visual de la piel (ej: Textura irregular, aspecto cansado)>",
    "eye_shape": "<string: Forma de los ojos (ej: Ojos almendrados)>"
  },
  "best_country": "<string>",
  "penalizing_trait": "<string: El rasgo menos armónico detectado>",
  "dominant_trait": "<string: Tu mejor rasgo físico>",
  "brutal_truth": "<string: 3 líneas de hechos fríos sobre tu estética, sin suavizar nada y sin dar recomendaciones médicas. Menciona cómo tu altura y edad afectan tu impacto visual.>",
  "improvement_plan": [ // OBLIGATORIO: DEBES INCLUIR EXACTAMENTE 3 ELEMENTOS
    {
      "focus": "<string: Ej. Definición de rostro>",
      "target_metric": "<string>",
      "protocol": "<string: Ejercicios o hábitos simples de 30 días>",
      "scientific_basis": "<string: Por qué funciona esto a nivel físico>"
    },
    {
      "focus": "<string: Otro enfoque>",
      "target_metric": "<string>",
      "protocol": "<string>",
      "scientific_basis": "<string>"
    },
    {
      "focus": "<string: Un tercer enfoque>",
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
