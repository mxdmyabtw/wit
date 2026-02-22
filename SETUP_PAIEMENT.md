# Configuration du paiement par carte (Stripe)

## 1. Compte Stripe

1. Crée un compte sur [stripe.com](https://stripe.com)
2. Récupère tes clés dans le [Dashboard Stripe](https://dashboard.stripe.com/apikeys) :
   - **Clé secrète** (sk_test_... en mode test, sk_live_... en prod)

## 2. Webhook Stripe

1. Dans [Stripe Webhooks](https://dashboard.stripe.com/webhooks), crée un endpoint
2. URL : `https://ton-site.netlify.app/.netlify/functions/stripe-webhook`
3. Événements : `checkout.session.completed`
4. Récupère le **Signing secret** (whsec_...)

## 3. Firebase Firestore

1. Active Firestore dans [Firebase Console](https://console.firebase.google.com) → ton projet → Firestore
2. Règles de sécurité (Mode test pour commencer) :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Crée un compte de service : Firebase Console → Paramètres du projet → Comptes de service → Générer une nouvelle clé privée
4. Copie le contenu JSON du fichier téléchargé

## 4. Variables d'environnement Netlify

Dans Netlify : Paramètres du site → Variables d'environnement :

| Variable | Valeur |
|----------|--------|
| `STRIPE_SECRET_KEY` | sk_test_... ou sk_live_... |
| `STRIPE_WEBHOOK_SECRET` | whsec_... |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Contenu JSON du compte de service (coller tout le JSON sur une ligne) |

## 5. Dépendances npm

Exécute à la racine du projet :
```bash
npm install stripe firebase-admin
```

## Tarifs des bundles (€)

| Pièces | Prix |
|--------|------|
| 5 | 5 € |
| 10 | 10 € |
| 15 | 15 € |
| 20 | 20 € |
| 25 | 25 € |
| 50 | 50 € |
| 100 | 100 € |

Les tarifs sont modifiables dans `netlify/functions/create-checkout-session.js` (objet `PRICES`).
