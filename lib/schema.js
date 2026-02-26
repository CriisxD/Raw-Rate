import { z } from 'zod';

export const RawRateSchema = z.object({
  base_score: z.number().min(1).max(10),
  perceived_score: z.number().min(1).max(10),
  radar_stats: z.object({
    symmetry: z.number().int().min(1).max(10),
    dominance: z.number().int().min(1).max(10),
    proportion: z.number().int().min(1).max(10),
    vitality: z.number().int().min(1).max(10),
  }),
  best_country: z.string(),
  penalizing_trait: z.string(),
  dominant_trait: z.string(),
  brutal_truth: z.string(),
  improvement_plan: z.array(z.string()).length(3),
});

export const MOCK_RESULT = {
  base_score: 6.8,
  perceived_score: 8.2,
  radar_stats: {
    symmetry: 7,
    dominance: 8,
    proportion: 6,
    vitality: 9,
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
