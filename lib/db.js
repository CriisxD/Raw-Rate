import { getSupabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// ─── In-memory demo store (when Supabase is not configured) ────────
const demoStore = {
  analyses: {},
};

function isDemoMode() {
  return !getSupabase();
}

// ─── ANALYSES ──────────────────────────────────────────────────────

export async function createAnalysis(sessionId) {
  const id = uuidv4();

  if (isDemoMode()) {
    demoStore.analyses[id] = {
      id,
      session_id: sessionId,
      status: 'pending',
      ai_raw_json: null,
      is_unlocked: false,
      has_upsell: false,
      created_at: new Date().toISOString(),
    };
    return id;
  }

  const sb = getSupabase();
  const { error } = await sb.from('analyses').insert({ id, session_id: sessionId });
  if (error) throw error;
  return id;
}

export async function updateAnalysisStatus(id, status, aiJson = null) {
  if (isDemoMode()) {
    if (demoStore.analyses[id]) {
      demoStore.analyses[id].status = status;
      if (aiJson) demoStore.analyses[id].ai_raw_json = aiJson;
    }
    return;
  }

  const sb = getSupabase();
  const update = { status };
  if (aiJson) update.ai_raw_json = aiJson;
  const { error } = await sb.from('analyses').update(update).eq('id', id);
  if (error) throw error;
}

export async function getAnalysis(id) {
  if (isDemoMode()) {
    return demoStore.analyses[id] || null;
  }

  const sb = getSupabase();
  const { data, error } = await sb.from('analyses').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function unlockAnalysis(id) {
  if (isDemoMode()) {
    if (demoStore.analyses[id]) demoStore.analyses[id].is_unlocked = true;
    return;
  }

  const sb = getSupabase();
  await sb.from('analyses').update({ is_unlocked: true }).eq('id', id);
}

export async function addUpsell(id) {
  if (isDemoMode()) {
    if (demoStore.analyses[id]) demoStore.analyses[id].has_upsell = true;
    return;
  }

  const sb = getSupabase();
  await sb.from('analyses').update({ has_upsell: true }).eq('id', id);
}

// ─── MEDIA ─────────────────────────────────────────────────────────

export async function saveMedia(analysisId, imageType, imageData) {
  const id = uuidv4();

  if (isDemoMode()) return id;

  const sb = getSupabase();
  await sb.from('media').insert({
    id,
    analysis_id: analysisId,
    image_type: imageType,
    image_data: imageData,
  });
  return id;
}

export async function getMedia(analysisId) {
  if (isDemoMode()) return [];

  const sb = getSupabase();
  const { data } = await sb.from('media').select('*').eq('analysis_id', analysisId);
  return data || [];
}

// ─── TRANSACTIONS ──────────────────────────────────────────────────

export async function createTransaction(analysisId, type, amountCents, lsOrderId = null) {
  const id = uuidv4();

  if (isDemoMode()) return id;

  const sb = getSupabase();
  await sb.from('transactions').insert({
    id,
    analysis_id: analysisId,
    transaction_type: type,
    amount_cents: amountCents,
    ls_order_id: lsOrderId,
  });
  return id;
}

export async function completeTransaction(lsOrderId) {
  if (isDemoMode()) return null;

  const sb = getSupabase();
  const { data: tx } = await sb
    .from('transactions')
    .select('*')
    .eq('ls_order_id', lsOrderId)
    .single();

  if (tx) {
    await sb.from('transactions').update({ status: 'succeeded' }).eq('ls_order_id', lsOrderId);
    if (tx.transaction_type === 'base_report') {
      await unlockAnalysis(tx.analysis_id);
    } else if (tx.transaction_type === 'upsell') {
      await addUpsell(tx.analysis_id);
    }
  }
  return tx;
}
