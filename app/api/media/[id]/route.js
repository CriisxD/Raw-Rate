import { NextResponse } from 'next/server';
import { getMedia } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const media = await getMedia(id);
    
    // Return an array of the image data urls
    const images = media.map(m => ({
      type: m.image_type,
      data: m.image_data,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Error al cargar medios' }, { status: 500 });
  }
}
