import { NextResponse } from 'next/server';
import { createTransaction, unlockAnalysis, addUpsell } from '@/lib/db';

export async function POST(request) {
  try {
    const { analysisId, type } = await request.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId requerido' }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    // Demo mode without API key
    if (!apiKey || !storeId) {
      if (type === 'upsell') {
        await addUpsell(analysisId);
      } else {
        await unlockAnalysis(analysisId);
      }
      return NextResponse.json({ demo: true, checkoutUrl: null });
    }

    const variantId = type === 'upsell'
      ? process.env.LEMONSQUEEZY_VARIANT_ID_UPSELL
      : process.env.LEMONSQUEEZY_VARIANT_ID_BASE;

    const amountCents = type === 'upsell' ? 299 : 499;

    // Create Lemon Squeezy checkout
    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: {
                analysis_id: analysisId,
                transaction_type: type || 'base_report',
              },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    });

    const data = await res.json();
    const checkoutUrl = data.data?.attributes?.url;

    if (checkoutUrl) {
      await createTransaction(analysisId, type || 'base_report', amountCents);
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Error al crear checkout' }, { status: 500 });
  }
}
