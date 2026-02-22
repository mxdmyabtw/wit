/**
 * Auth - Google d'abord, pseudo lie au compte Google
 * Le pseudo est demande uniquement apres connexion Google, et lie a ce compte.
 */
(function() {
  const STORAGE_USER = 'wit-user';
  const STORAGE_STATS = 'wit-match-stats';
  const STORAGE_PROFILE_PREFIX = 'wit-profile-';

  let modalPseudoEl = null;
  let firebaseAuth = null;

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
    } catch (_) { return null; }
  }

  var authListeners = [];

  function setUser(u) {
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_USER);
    authListeners.forEach(function(f) { try { f(u); } catch (_) {} });
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

  function getProfileForGoogleUid(uid) {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PROFILE_PREFIX + uid) || 'null');
    } catch (_) { return null; }
  }

  function saveProfileForGoogleUid(uid, profile) {
    localStorage.setItem(STORAGE_PROFILE_PREFIX + uid, JSON.stringify(profile));
  }

  function showPseudoModal(googleUser) {
    return new Promise(function(resolve) {
      if (modalPseudoEl && modalPseudoEl.parentNode) {
        modalPseudoEl.parentNode.removeChild(modalPseudoEl);
      }
      modalPseudoEl = document.createElement('div');
      modalPseudoEl.id = 'modal-pseudo';
      modalPseudoEl.className = 'modal-pseudo';
      modalPseudoEl.innerHTML = '<div class="modal-pseudo-inner">' +
        '<h2 class="modal-pseudo-title">Choose your username</h2>' +
        '<p class="modal-pseudo-desc">Your username will be linked to your Google account.</p>' +
        '<div class="modal-pseudo-form">' +
        '<input type="text" id="pseudo-input" placeholder="Your username" maxlength="20" autocomplete="username">' +
        '<button type="button" id="pseudo-submit">Confirm</button>' +
        '</div></div>';
      document.body.appendChild(modalPseudoEl);
      modalPseudoEl.classList.add('open');

      var input = document.getElementById('pseudo-input');
      var btn = document.getElementById('pseudo-submit');

      function finish() {
        var pseudo = (input && input.value || '').trim().slice(0, 20);
        if (!pseudo) {
          alert('Choose a username.');
          return;
        }
        modalPseudoEl.classList.remove('open');
        setTimeout(function() {
          if (modalPseudoEl && modalPseudoEl.parentNode) modalPseudoEl.parentNode.removeChild(modalPseudoEl);
          modalPseudoEl = null;
        }, 300);
        resolve({ pseudo: pseudo, googleUser: googleUser });
      }

      if (btn) btn.addEventListener('click', finish);
      if (input) {
        input.focus();
        input.addEventListener('keypress', function(e) { if (e.key === 'Enter') finish(); });
      }
    });
  }

  function buildUserFromGoogle(googleUser, pseudo) {
    var uid = googleUser.uid;
    var email = googleUser.email || '';
    var pdp = googleUser.photoURL || null;
    return {
      id: 'google_' + uid,
      googleUid: uid,
      email: email,
      pseudo: pseudo || '',
      pdp: pdp,
      epicLinked: false,
      discordLinked: false
    };
  }

  function initFirebaseAuth() {
    if (firebaseAuth) return Promise.resolve(firebaseAuth);
    var config = window.WIT_FIREBASE_CONFIG;
    if (!config || !config.apiKey) return Promise.resolve(null);
    return new Promise(function(resolve) {
      if (window.firebase && window.firebase.auth) {
        try {
          if (!window.firebase.apps.length) window.firebase.initializeApp(config);
          firebaseAuth = window.firebase.auth();
          resolve(firebaseAuth);
        } catch (e) {
          console.warn('Firebase init error:', e);
          resolve(null);
        }
        return;
      }
      var s1 = document.createElement('script');
      s1.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js';
      s1.onload = function() {
        var s2 = document.createElement('script');
        s2.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js';
        s2.onload = function() {
          try {
            window.firebase.initializeApp(config);
            firebaseAuth = window.firebase.auth();
            resolve(firebaseAuth);
          } catch (e) {
            console.warn('Firebase init error:', e);
            resolve(null);
          }
        };
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    });
  }

  function loginWithGoogle() {
    return initFirebaseAuth().then(function(auth) {
      if (!auth) {
        alert('Configure Firebase (config-firebase.js) to sign in with Google.');
        return null;
      }
      var provider = new window.firebase.auth.GoogleAuthProvider();
      return auth.signInWithPopup(provider).then(function(result) {
        var u = result.user;
        var uid = u.uid;
        var profile = getProfileForGoogleUid(uid);
        var pseudo = profile && profile.pseudo ? profile.pseudo : null;
        if (pseudo) {
          var user = buildUserFromGoogle({ uid: uid, email: u.email, photoURL: u.photoURL }, pseudo);
          setUser(user);
          initStats();
          return user;
        }
        return showPseudoModal({ uid: uid, email: u.email || '', photoURL: u.photoURL || null }).then(function(data) {
          saveProfileForGoogleUid(uid, { pseudo: data.pseudo });
          var user = buildUserFromGoogle(data.googleUser, data.pseudo);
          setUser(user);
          initStats();
          return user;
        });
      }).catch(function(err) {
        if (err.code === 'auth/popup-closed-by-user') return null;
        console.error('Google auth error:', err);
        alert('Google sign-in error: ' + (err.message || 'Try again.'));
        return null;
      });
    });
  }

  function login() {
    var u = getUser();
    if (u) return Promise.resolve(u);
    return loginWithGoogle();
  }

  function updatePdp(url) {
    var u = getUser();
    if (!u) return;
    u.pdp = url;
    setUser(u);
  }

  function logout() {
    if (firebaseAuth) {
      firebaseAuth.signOut().catch(function() {});
    }
    setUser(null);
  }

  window.WitAuth = {
    getUser: getUser,
    isLoggedIn: function() { return !!getUser(); },
    login: login,
    loginGoogle: loginWithGoogle,
    logout: logout,
    updatePdp: updatePdp,
    getStats: getStats,
    initStats: initStats,
    addMatchResult: addMatchResult,
    onAuthStateChanged: function(callback) {
      authListeners.push(callback);
      callback(getUser());
    },
    searchUser: function(pseudo) {
      var u = getUser();
      if (!u || !pseudo) return null;
      if ((u.pseudo || '').toLowerCase().includes((pseudo || '').trim().toLowerCase())) return u;
      return null;
    },
    linkEpic: function() {},
    linkDiscord: function() {},
    hasGoogleAuth: function() { return !!(window.WIT_FIREBASE_CONFIG && window.WIT_FIREBASE_CONFIG.apiKey); }
  };
})();
