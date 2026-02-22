/**
 * Auth & Profils - Firebase Auth (Google) ou simulation
 * Si WIT_FIREBASE_CONFIG est defini et valide, utilise Firebase Auth.
 * Sinon fallback sur simulation pour dev.
 * ATTENTION: Le token Discord ne doit JAMAIS etre dans le frontend - le bot tourne cote serveur
 */

(function() {
  const STORAGE_USER = 'wit-user';
  const STORAGE_STATS = 'wit-match-stats';

  let firebaseAuth = null;
  let firebaseInitialized = false;

  function initFirebase() {
    if (firebaseInitialized) return firebaseAuth;
    const cfg = typeof window !== 'undefined' && window.WIT_FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || cfg.apiKey === 'AIza...') return null;
    if (typeof firebase === 'undefined') return null;
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      firebaseAuth = firebase.auth();
      firebaseInitialized = true;
      return firebaseAuth;
    } catch (e) {
      console.warn('Firebase init failed:', e);
      return null;
    }
  }

  function useFirebase() {
    return !!initFirebase();
  }

  function firebaseUserToWitUser(fbUser) {
    if (!fbUser) return null;
    const email = fbUser.email || '';
    const displayName = fbUser.displayName || email.split('@')[0] || 'Joueur';
    const photoURL = fbUser.photoURL || null;
    return {
      id: fbUser.uid,
      email: email,
      pseudo: displayName.slice(0, 20),
      pdp: photoURL,
      epicLinked: false,
      discordLinked: false
    };
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
    } catch (_) { return null; }
  }

  function setUser(u) {
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_USER);
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
    var s = getStats();
    if (typeof s.totalEarned !== 'number') s.totalEarned = 0;
    if (typeof s.wins !== 'number') s.wins = 0;
    if (typeof s.losses !== 'number') s.losses = 0;
    if (typeof s.matchesPlayed !== 'number') s.matchesPlayed = 0;
    saveStats(s);
    return s;
  }

  function addMatchResult(won, amount) {
    var s = getStats();
    s.matchesPlayed = (s.matchesPlayed || 0) + 1;
    if (won) {
      s.wins = (s.wins || 0) + 1;
      s.totalEarned = (s.totalEarned || 0) + (amount || 0);
    } else {
      s.losses = (s.losses || 0) + 1;
    }
    saveStats(s);
  }

  function loginGoogleSimulated() {
    var pseudo = 'Invite_' + Math.random().toString(36).slice(2, 8);
    var u = {
      id: 'g_' + Date.now(),
      email: '',
      pseudo: pseudo,
      pdp: null,
      epicLinked: false,
      discordLinked: false
    };
    setUser(u);
    initStats();
    return Promise.resolve(u);
  }

  function loginGoogle() {
    return loginGoogleSimulated();
  }

  function logout() {
    if (useFirebase()) {
      var auth = initFirebase();
      auth.signOut().catch(function() {});
    }
    setUser(null);
  }

  window.WitAuth = {
    getUser: getUser,
    isLoggedIn: function() { return !!getUser(); },
    loginGoogle: loginGoogle,
    logout: logout,
    getStats: getStats,
    initStats: initStats,
    addMatchResult: addMatchResult,
    onAuthStateChanged: function(callback) {
      if (useFirebase()) {
        initFirebase().onAuthStateChanged(function(fbUser) {
          if (fbUser) {
            var u = firebaseUserToWitUser(fbUser);
            setUser(u);
            callback(u);
          } else {
            setUser(null);
            callback(null);
          }
        });
      } else {
        callback(getUser());
      }
    },
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

  if (useFirebase()) {
    initFirebase().onAuthStateChanged(function(fbUser) {
      if (fbUser) setUser(firebaseUserToWitUser(fbUser));
      else setUser(null);
    });
  }
})();
