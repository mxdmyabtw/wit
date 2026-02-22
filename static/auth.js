/**
 * Auth & Profils - Simulation pour site statique
 * Pour une vraie implémentation: utiliser Firebase Auth (Google) + backend
 * ATTENTION: Le token Discord ne doit JAMAIS être dans le frontend - le bot tourne côté serveur
 */

(function() {
  const STORAGE_USER = 'wit-user';
  const STORAGE_STATS = 'wit-match-stats';

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
    } catch (_) { return null; }
  }

  function getStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_STATS) || '{}');
    } catch (_) { return {}; }
  }

  function saveStats(s) {
    localStorage.setItem(STORAGE_STATS, JSON.stringify(s));
  }

  function initStats() {
    let s = getStats();
    if (typeof s.totalEarned !== 'number') s.totalEarned = 0;
    if (typeof s.wins !== 'number') s.wins = 0;
    if (typeof s.losses !== 'number') s.losses = 0;
    if (typeof s.matchesPlayed !== 'number') s.matchesPlayed = 0;
    saveStats(s);
    return s;
  }

  function addMatchResult(won, amount) {
    const s = getStats();
    s.matchesPlayed = (s.matchesPlayed || 0) + 1;
    if (won) {
      s.wins = (s.wins || 0) + 1;
      s.totalEarned = (s.totalEarned || 0) + (amount || 0);
    } else {
      s.losses = (s.losses || 0) + 1;
    }
    saveStats(s);
  }

  window.WitAuth = {
    getUser,
    isLoggedIn: () => !!getUser(),
    loginGoogle: function() {
      var pseudo = prompt('Connexion avec Google simulee. Choisis ton pseudo :');
      if (!pseudo || !pseudo.trim()) return null;
      var u = {
        id: 'g_' + Date.now(),
        email: 'user@gmail.com',
        pseudo: pseudo.trim().slice(0, 20),
        pdp: null,
        epicLinked: false,
        discordLinked: false
      };
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
      initStats();
      return u;
    },
    logout: function() {
      localStorage.removeItem(STORAGE_USER);
    },
    getStats,
    initStats,
    addMatchResult,
    searchUser: function(pseudo) {
      var u = getUser();
      if (!u || !pseudo) return null;
      if (u.pseudo.toLowerCase().includes((pseudo || '').trim().toLowerCase())) return u;
      return null;
    },
    linkEpic: function() { alert('Lier Epic Games - a configurer avec ton backend.'); },
    linkDiscord: function() {
      var u = getUser();
      if (!u) return;
      var cid = (window.WIT_DISCORD_CLIENT_ID || '1474959660992692375');
      var url = 'https://discord.com/api/oauth2/authorize?client_id=' + cid + '&redirect_uri=' + encodeURIComponent(window.location.origin + '/') + '&response_type=code&scope=identify';
      alert('Pour lier Discord :\n1. Va sur ton serveur Discord et utilise la commande de ton bot (ex: /link)\n2. Ou ouvre ce lien dans un nouvel onglet : ' + url + '\n\nLe token du bot ne doit JAMAIS etre dans le frontend - regenere-le si tu l\'as expose.');
    }
  };
})();
