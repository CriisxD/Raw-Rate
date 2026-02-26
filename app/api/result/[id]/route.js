import { NextResponse } from 'next/server';
import { getAnalysis } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const full = searchParams.get('full');

    const analysis = await getAnalysis(id);
    if (!analysis) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const aiData = analysis.ai_raw_json || {};

    // Always return basic data
    const response = {
      id: analysis.id,
      status: analysis.status,
      is_unlocked: !!analysis.is_unlocked,
      has_upsell: !!analysis.has_upsell,
      base_score: aiData.base_score,
      perceived_score: aiData.perceived_score,
      penalizing_trait: aiData.penalizing_trait,
      dominant_trait: aiData.dominant_trait,
    };

    // Full data (for dashboard - in demo mode always return full)
    if (full || analysis.is_unlocked || !process.env.LEMONSQUEEZY_API_KEY) {
      response.radar_stats = aiData.radar_stats;
      response.brutal_truth = aiData.brutal_truth;
      response.best_country = aiData.best_country;
      response.improvement_plan = aiData.improvement_plan;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Result error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
