import { NextResponse } from 'next/server';
import { createAnalysis, updateAnalysisStatus, saveMedia } from '@/lib/db';
import { analyzeImages } from '@/lib/openai';

export const maxDuration = 60; // Allow more time for OpenAI Vision processing

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, images } = body;

    if (!images || !images.front || !images.profile || !images.smile || !images.body) {
      return NextResponse.json({ error: 'Se requieren las 4 imágenes' }, { status: 400 });
    }

    // Create analysis record
    const analysisId = await createAnalysis(sessionId || 'anonymous');

    // Save media records
    for (const [type, data] of Object.entries(images)) {
      await saveMedia(analysisId, type, data);
    }

    // Update status to processing
    await updateAnalysisStatus(analysisId, 'processing');

    // Run AI analysis
    try {
      const imageDataUrls = [images.front, images.profile, images.smile, images.body];
      const result = await analyzeImages(imageDataUrls);
      await updateAnalysisStatus(analysisId, 'completed', result);
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      const { MOCK_RESULT } = await import('@/lib/schema');
      const errorMsg = aiError instanceof Error ? aiError.message : String(aiError);
      
      const debugResult = {
        ...MOCK_RESULT,
        penalizing_trait: `[API ERROR] ${errorMsg.substring(0, 80)}`,
        dominant_trait: `[IA FAILED]`,
        brutal_truth: `[ERROR INTERNO IA] ${errorMsg}. Revisa los logs de Vercel.`
      };
      
      await updateAnalysisStatus(analysisId, 'completed', debugResult);
    }

    return NextResponse.json({ id: analysisId });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
