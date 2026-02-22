/**
 * Auth & Profils - Pseudo au centre + changement pdp dans profil
 */
(function() {
  const STORAGE_USER = 'wit-user';
  const STORAGE_STATS = 'wit-match-stats';

  let modalPseudoEl = null;

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

  function showPseudoModal() {
    return new Promise(function(resolve) {
      if (modalPseudoEl && modalPseudoEl.parentNode) {
        modalPseudoEl.parentNode.removeChild(modalPseudoEl);
      }
      modalPseudoEl = document.createElement('div');
      modalPseudoEl.id = 'modal-pseudo';
      modalPseudoEl.className = 'modal-pseudo';
      modalPseudoEl.innerHTML = '<div class="modal-pseudo-inner">' +
        '<h2 class="modal-pseudo-title">Veuillez choisir un pseudo</h2>' +
        '<div class="modal-pseudo-form">' +
        '<input type="text" id="pseudo-input" placeholder="Ton pseudo" maxlength="20" autocomplete="username">' +
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
        modalPseudoEl.classList.remove('open');
        setTimeout(function() {
          if (modalPseudoEl && modalPseudoEl.parentNode) modalPseudoEl.parentNode.removeChild(modalPseudoEl);
          modalPseudoEl = null;
        }, 300);
        resolve(pseudo);
      }

      if (btn) btn.addEventListener('click', finish);
      if (input) {
        input.focus();
        input.addEventListener('keypress', function(e) { if (e.key === 'Enter') finish(); });
      }
    });
  }

  function login() {
    var u = getUser();
    if (u) return Promise.resolve(u);
    return showPseudoModal().then(function(pseudo) {
      u = {
        id: 'u_' + Date.now(),
        email: '',
        pseudo: pseudo,
        pdp: null,
        epicLinked: false,
        discordLinked: false
      };
      setUser(u);
      initStats();
      return u;
    });
  }

  function updatePdp(url) {
    var u = getUser();
    if (!u) return;
    u.pdp = url;
    setUser(u);
  }

  function logout() {
    setUser(null);
  }

  window.WitAuth = {
    getUser: getUser,
    isLoggedIn: function() { return !!getUser(); },
    login: login,
    loginGoogle: login,
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
    linkDiscord: function() {}
  };
})();
