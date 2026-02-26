import { z } from 'zod';

export const RawRateSchema = z.object({
  base_score: z.number().min(1).max(10),
  perceived_score: z.number().min(1).max(10),
  max_potential_score: z.number().min(1).max(10),
  social_percentile: z.number().int().min(1).max(99),
  radar_stats: z.object({
    symmetry: z.number().int().min(1).max(10),
    dominance: z.number().int().min(1).max(10),
    proportion: z.number().int().min(1).max(10),
    vitality: z.number().int().min(1).max(10),
  }),
  clinical_metrics: z.object({
    canthal_tilt: z.string(),
    jawline_definition: z.string(),
    facial_thirds_ratio: z.string(),
    nose_to_lip_ratio: z.string(),
    skin_quality: z.string(),
    eye_shape: z.string(),
  }),
  best_country: z.string(),
  penalizing_trait: z.string(),
  dominant_trait: z.string(),
  brutal_truth: z.string(),
  improvement_plan: z.array(z.string()).length(3),
});

export const MOCK_RESULT = {
  base_score: 7.5,
  perceived_score: 8.0,
  max_potential_score: 9.1,
  social_percentile: 72,
  radar_stats: {
    symmetry: 7,
    dominance: 8,
    proportion: 6,
    vitality: 9,
  },
  clinical_metrics: {
    canthal_tilt: "Positivo (+3°)",
    jawline_definition: "Estructuralmente fuerte, pero asimétrica",
    facial_thirds_ratio: "Tercio medio facial ligeramente elongado (1:1.1:1)",
    nose_to_lip_ratio: "Compacto (Ratio 1:2.5)",
    skin_quality: "Alta vitalidad, textura mínima",
    eye_shape: "Almendrados profundos (Hunter Eyes)",
  },
  best_country: "Brasil",
  penalizing_trait: "asimetría mandibular izquierda y postura cifótica leve",
  dominant_trait: "estructura ósea maxilar pronunciada con ratio áureo en tercio medio facial",
  brutal_truth: "Tu estructura ósea tiene potencial genético notable, especialmente en la proyección zigomática y el ratio canthal. Sin embargo, la asimetría mandibular izquierda de aproximadamente 3mm y una postura cifótica leve están saboteando tu score. La discrepancia entre tu base_score y perceived_score sugiere que tu energía facial compensa deficiencias estructurales — pero la cámara no miente.",
  improvement_plan: [
    "Corregir postura cifótica con ejercicios de retracción cervical y chin tucks — 3 series de 15 repeticiones diarias durante 30 días para ganar +0.4 puntos en proporción.",
    "Mewing consistente (postura lingual correcta contra el paladar) para optimizar la línea mandibular y reducir la asimetría percibida en fotografías.",
    "Rutina de skincare con retinol 0.5% nocturno y SPF 50 diario para maximizar la vitalidad cutánea y subir el score de vitalidad de 9 a 10."
  ],
};
