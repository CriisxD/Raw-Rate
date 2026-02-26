import { z } from 'zod';

export const RawRateSchema = z.object({
  internal_reasoning: z.string().optional(),
  base_score: z.number().min(1).max(10),
  perceived_score: z.number().min(1).max(10),
  max_potential_score: z.number().min(1).max(10),
  social_percentile: z.number().int().min(1).max(99),
  aesthetic_archetype: z.string(),
  radar_stats: z.object({
    symmetry: z.number().int().min(1).max(10),
    dominance: z.number().int().min(1).max(10),
    proportion: z.number().int().min(1).max(10),
    vitality: z.number().int().min(1).max(10),
    dimorphism: z.number().int().min(1).max(10),
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
  improvement_plan: z.array(z.object({
    focus: z.string(),
    target_metric: z.string(),
    protocol: z.string(),
    scientific_basis: z.string(),
  })).min(3),
});

export const MOCK_RESULT = {
  internal_reasoning: "Base 7.0 + 0.3 por contraste alto + 0.2 por edad ideal (24 años) = 7.5. La asimetría mandibular penaliza la proporción general.",
  base_score: 7.5,
  perceived_score: 8.0,
  max_potential_score: 9.1,
  social_percentile: 72,
  aesthetic_archetype: "Vampiro Europeo / High-Fashion Cifótico",
  radar_stats: {
    symmetry: 7,
    dominance: 8,
    proportion: 6,
    vitality: 9,
    dimorphism: 8,
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
    {
      focus: "Reestructuración Postural y Cervical",
      target_metric: "Aumentar Proporción de 6 a 7.5",
      protocol: "Realizar 3 series de 20 'chin tucks' (retracciones cervicales) diarias al despertar. Mantener postura neutral al usar pantallas (ergonomía a nivel de los ojos) para corregir la cifosis leve. Aplicar masajes miofasciales en el esternocleidomastoideo durante 5 minutos por noche.",
      scientific_basis: "La postura de cabeza adelantada acorta el cuello visualmente y oculta la definición mandibular por relajación de los músculos hioideos. La corrección alinea la columna cervical, tensando la piel submental y mejorando el ángulo cérvicomentoniano."
    },
    {
      focus: "Definición y Simetría Mandibular",
      target_metric: "Optimizar Dominancia de 8 a 9",
      protocol: "Implementar 'Mewing' estricto: mantener la lengua pegada al paladar completo en estado de reposo, incluyendo el tercio posterior. Masticar chicle de masilla (mastic gum) unilateralmente en el lado derecho durante 15 minutos diarios para hipertrofiar el masetero y compensar la asimetría izquierda.",
      scientific_basis: "La postura lingual correcta genera una expansión maxilar sutil a largo plazo y soporte inmediato de los tejidos blandos submandibulares. El entrenamiento unilateral de resistencia induce adaptaciones hipertróficas en el músculo masetero, equilibrando visualmente el tercio inferior."
    },
    {
      focus: "Optimización de Vitalidad Cutánea",
      target_metric: "Maximizar Vitalidad de 9 a 10",
      protocol: "AM: Limpiador suave, suero de Niacinamida 10%, y obligatoriamente Protector Solar Mineral SPF 50+. PM: Doble limpieza, Tretinoína 0.025% (3 noches por semana), crema hidratante con ceramidas. Beber mínimo 3.5 litros de agua y suplementar con Omega-3 (2000mg).",
      scientific_basis: "La Niacinamida reduce el eritema y refina la textura. La Tretinoína (retinoide prescrito) es el gold standard clínico que acelera la renovación celular, estimula la producción de colágeno tipo I y reduce la hiperpigmentación, resultando en un 'glow' o vitalidad dérmica cuantificable."
    }
  ],
};
