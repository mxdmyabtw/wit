/**
 * Auth & Profils - Firebase Auth (Google) puis choix du pseudo
 * 1. Connexion avec compte Google (popup)
 * 2. Modale "Veuillez choisir un pseudo" au centre
 * ATTENTION: Le token Discord ne doit JAMAIS etre dans le frontend - le bot tourne cote serveur
 */

(function() {
  const STORAGE_USER = 'wit-user';
  const STORAGE_STATS = 'wit-match-stats';

  let firebaseAuth = null;
  let firebaseInitialized = false;
  let modalPseudoEl = null;

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

  function firebaseUserToBaseUser(fbUser) {
    if (!fbUser) return null;
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      pseudo: null,
      pdp: fbUser.photoURL || null,
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

  function showPseudoModal(baseUser) {
    return new Promise(function(resolve) {
      if (modalPseudoEl && modalPseudoEl.parentNode) {
        modalPseudoEl.parentNode.removeChild(modalPseudoEl);
      }
      modalPseudoEl = document.createElement('div');
      modalPseudoEl.id = 'modal-pseudo';
      modalPseudoEl.className = 'modal-pseudo';
      var suggestion = (baseUser && baseUser.email) ? baseUser.email.split('@')[0] : '';
      modalPseudoEl.innerHTML = '<div class="modal-pseudo-inner">' +
        '<h2 class="modal-pseudo-title">Veuillez choisir un pseudo</h2>' +
        '<div class="modal-pseudo-form">' +
        '<input type="text" id="pseudo-input" placeholder="Ton pseudo" maxlength="20" value="' + (suggestion || '').replace(/"/g, '&quot;') + '" autocomplete="username">' +
        '<button type="button" id="pseudo-submit">Valider</button>' +
        '</div></div>';
      document.body.appendChild(modalPseudoEl);
      modalPseudoEl.classList.add('open');

      var input = document.getElementById('pseudo-input');
      var btn = document.getElementById('pseudo-submit');

      function finish() {
        var pseudo = (input && input.value || '').trim().slice(0, 20);
        if (!pseudo) {
          alert('Choisis un pseudo.');
          return;
        }
        var u = Object.assign({}, baseUser || {}, { pseudo: pseudo });
        modalPseudoEl.classList.remove('open');
        setTimeout(function() {
          if (modalPseudoEl.parentNode) modalPseudoEl.parentNode.removeChild(modalPseudoEl);
          modalPseudoEl = null;
        }, 300);
        resolve(u);
      }

      if (btn) btn.addEventListener('click', finish);
      if (input) {
        input.focus();
        input.addEventListener('keypress', function(e) { if (e.key === 'Enter') finish(); });
      }
    });
  }

  function loginGoogleSimulated() {
    var baseUser = {
      id: 'g_' + Date.now(),
      email: '',
      pseudo: null,
      pdp: null,
      epicLinked: false,
      discordLinked: false
    };
    return showPseudoModal(baseUser).then(function(u) {
      setUser(u);
      initStats();
      return u;
    });
  }

  function loginGoogle() {
    if (useFirebase()) {
      var auth = initFirebase();
      var provider = new firebase.auth.GoogleAuthProvider();
      return auth.signInWithPopup(provider)
        .then(function(result) {
          var baseUser = firebaseUserToBaseUser(result.user);
          var stored = getUser();
          if (stored && stored.id === baseUser.id && stored.pseudo) {
            setUser(stored);
            initStats();
            return stored;
          }
          return showPseudoModal(baseUser).then(function(u) {
            setUser(u);
            initStats();
            return u;
          });
        })
        .catch(function(err) {
          console.error('Firebase signIn error:', err);
          if (err.code === 'auth/popup-closed-by-user') return null;
          alert('Connexion Google echouee: ' + (err.message || 'Erreur inconnue'));
          return null;
        });
    }
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
    showPseudoModal: showPseudoModal,
    onAuthStateChanged: function(callback) {
      if (useFirebase()) {
        initFirebase().onAuthStateChanged(function(fbUser) {
          if (fbUser) {
            var stored = getUser();
            if (stored && stored.id === fbUser.uid && stored.pseudo) {
              setUser(stored);
              callback(stored);
              return;
            }
            var baseUser = firebaseUserToBaseUser(fbUser);
            showPseudoModal(baseUser).then(function(u) {
              setUser(u);
              initStats();
              callback(u);
            });
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
      if (fbUser) {
        var stored = getUser();
        if (stored && stored.id === fbUser.uid && stored.pseudo) {
          setUser(stored);
        } else {
          var baseUser = firebaseUserToBaseUser(fbUser);
          showPseudoModal(baseUser).then(function(u) {
            setUser(u);
            initStats();
          });
        }
      } else {
        setUser(null);
      }
    });
  }
})();
