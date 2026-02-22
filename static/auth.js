/**
 * Auth - localStorage uniquement, connexion auto en invité
 * Pseudo unique : un pseudo deja utilise ne peut pas etre choisi par un autre
 */
(function() {
  const STORAGE_USER = 'wit-user';
  const STORAGE_STATS = 'wit-match-stats';
  const STORAGE_PSEUDOS = 'wit-pseudos';
  var authListeners = [];

  function getPseudoRegistry() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PSEUDOS) || '{}');
    } catch (_) { return {}; }
  }

  function savePseudoRegistry(reg) {
    localStorage.setItem(STORAGE_PSEUDOS, JSON.stringify(reg));
  }

  function isPseudoAvailable(pseudo, excludeUserId) {
    var p = (pseudo || '').trim().toLowerCase();
    if (!p || p.length < 2) return false;
    var reg = getPseudoRegistry();
    var owner = reg[p];
    return !owner || (excludeUserId && owner === excludeUserId);
  }

  function registerPseudo(pseudo, userId) {
    var p = (pseudo || '').trim().toLowerCase();
    if (!p) return;
    var reg = getPseudoRegistry();
    reg[p] = userId;
    savePseudoRegistry(reg);
  }

  function unregisterPseudo(pseudo) {
    var p = (pseudo || '').trim().toLowerCase();
    if (!p) return;
    var reg = getPseudoRegistry();
    delete reg[p];
    savePseudoRegistry(reg);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
    } catch (_) { return null; }
  }

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

  function login() {
    var u = getUser();
    if (u) return Promise.resolve(u);
    var id = 'u_' + Date.now();
    var pseudo = 'Invite_' + Math.random().toString(36).slice(2, 8);
    registerPseudo(pseudo, id);
    u = {
      id: id,
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

  function setPseudo(newPseudo) {
    var u = getUser();
    if (!u) return false;
    var p = (newPseudo || '').trim().slice(0, 20);
    if (!p || p.length < 2) return false;
    if (!isPseudoAvailable(p, u.id)) return false;
    unregisterPseudo(u.pseudo);
    registerPseudo(p, u.id);
    u.pseudo = p;
    setUser(u);
    return true;
  }

  function logout() {
    var u = getUser();
    if (u) unregisterPseudo(u.pseudo);
    setUser(null);
  }

  window.WitAuth = {
    getUser: getUser,
    isLoggedIn: function() { return !!getUser(); },
    login: login,
    logout: logout,
    getStats: getStats,
    initStats: initStats,
    addMatchResult: addMatchResult,
    onAuthStateChanged: function(callback) {
      authListeners.push(callback);
      if (!getUser()) login().then(function() { callback(getUser()); });
      else callback(getUser());
    },
    searchUser: function(pseudo) {
      var u = getUser();
      if (!u || !pseudo) return null;
      if ((u.pseudo || '').toLowerCase().includes((pseudo || '').trim().toLowerCase())) return u;
      return null;
    },
    linkEpic: function() {},
    linkDiscord: function() {},
    setPseudo: setPseudo,
    isPseudoAvailable: isPseudoAvailable
  };

  if (!getUser()) login();
})();
