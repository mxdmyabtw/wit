/**
 * Config Discord - Client ID uniquement (pour OAuth redirect)
 * Le TOKEN du bot ne doit JAMAIS etre ici ni dans le frontend.
 * Le bot tourne cote serveur. Pour lier un compte Discord :
 * 1. Ton bot Discord recoit une commande (ex: /link)
 * 2. Le bot genere un lien OAuth ou un code
 * 3. L'utilisateur ouvre le lien et autorise
 * 4. Ton backend enregistre la liaison
 */
window.WIT_DISCORD_CLIENT_ID = '1474959660992692375';
