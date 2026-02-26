import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// This is designed to be called by a CRON job (e.g. Vercel Cron)
// It deletes all analyses that were created more than 24 hours ago.
// In Supabase, deleting an analysis should cascade and delete its associated media and transactions.
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Simple cron secret protection
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const sb = getSupabase();
    if (!sb) {
      return NextResponse.json({ message: 'No Supabase connection configured.' });
    }

    // Calculate time 24 hours ago
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const timeLimit = yesterday.toISOString();

    console.log(`[Cleanup Cron] Deleting analyses older than: ${timeLimit}`);

    const { data, error } = await sb
      .from('analyses')
      .delete()
      .lt('created_at', timeLimit)
      .select('id');

    if (error) {
      console.error('[Cleanup Cron] Error deleting records:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const deletedCount = data ? data.length : 0;
    console.log(`[Cleanup Cron] Successfully deleted ${deletedCount} expired analyses.`);

    return NextResponse.json({ 
      success: true, 
      deleted_count: deletedCount,
      message: 'Cleanup successful' 
    });

  } catch (err) {
    console.error('[Cleanup Cron] Fatal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
