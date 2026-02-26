import { NextResponse } from 'next/server';
import { getAnalysis } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const analysis = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      status: analysis.status,
      base_score: analysis.ai_raw_json?.base_score,
      perceived_score: analysis.ai_raw_json?.perceived_score,
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
