/**
 * Netlify Function : crée une session Stripe Checkout
 * POST /.netlify/functions/create-checkout-session
 * Body: { amount: number, userId: string }
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Prix en centimes (€) par nombre de pièces : 1 pièce = 1 €
const PRICES = {
  5: 500,     // 5 €
  10: 1000,   // 10 €
  15: 1500,   // 15 €
  20: 2000,   // 20 €
  25: 2500,   // 25 €
  50: 5000,   // 50 €
  100: 10000  // 100 €
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, userId } = JSON.parse(event.body || '{}');
    const amountNum = parseInt(amount, 10);

    if (!amountNum || !PRICES[amountNum]) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Montant invalide' })
      };
    }

    if (!userId || typeof userId !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Connexion requise pour payer' })
      };
    }

    const priceCentimes = PRICES[amountNum];
    const baseUrl = process.env.URL || event.headers.origin || 'https://wit.example.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${amountNum} pièces Win is Key`,
            description: 'Pièces virtuelles pour parier sur les matchs',
            images: [baseUrl.replace(/\/$/, '') + '/images/coin.png']
          },
          unit_amount: priceCentimes
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${baseUrl}/boutique.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/boutique.html?payment=cancelled`,
      metadata: {
        amount: String(amountNum),
        userId
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url, sessionId: session.id })
    };
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Erreur serveur' })
    };
  }
};
