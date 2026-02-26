import { NextResponse } from 'next/server';
import { completeTransaction, unlockAnalysis, addUpsell, createTransaction } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    // Verify signature
    if (webhookSecret && signature) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(rawBody);
      const digest = hmac.digest('hex');

      if (digest !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    const orderId = payload.data?.id;
    const analysisId = customData.analysis_id;
    const transactionType = customData.transaction_type || 'base_report';

    if (eventName === 'order_created' && analysisId) {
      const amountCents = transactionType === 'upsell' ? 299 : 499;
      await createTransaction(analysisId, transactionType, amountCents, orderId);

      if (transactionType === 'upsell') {
        await addUpsell(analysisId);
      } else {
        await unlockAnalysis(analysisId);
      }

      console.log(`✓ Order processed: ${orderId} for analysis ${analysisId} (${transactionType})`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
