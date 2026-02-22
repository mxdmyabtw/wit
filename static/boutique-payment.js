/**
 * Pièces et paiements - localStorage par compte utilisateur
 * Visiteur non connecté = 0 pièce. Compte obligatoire pour acheter, miser, etc.
 */
(function() {
  const STORAGE_COINS_LEGACY = 'wit-coins';

  function getUserId() {
    if (typeof window.WitAuth !== 'undefined' && window.WitAuth.getUser) {
      var u = window.WitAuth.getUser();
      return u ? u.id : null;
    }
    return null;
  }

  function getCoinsStorageKey() {
    var id = getUserId();
    return id ? 'wit-coins-' + id : null;
  }

  function getSnipesStorageKey() {
    var id = getUserId();
    return id ? 'wit-snipes-' + id : null;
  }

  function getCoinsEl() {
    return document.getElementById('coins');
  }

  function updateCoinsDisplay(val) {
    var el = getCoinsEl();
    if (el) el.textContent = parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 1 });
  }

  function loadCoinsFromStorage() {
    var key = getCoinsStorageKey();
    if (!key) return 0;
    var raw = localStorage.getItem(key);
    if (raw === null && localStorage.getItem(STORAGE_COINS_LEGACY)) {
      var val = parseFloat(localStorage.getItem(STORAGE_COINS_LEGACY) || '1000');
      localStorage.setItem(key, String(val));
      localStorage.removeItem(STORAGE_COINS_LEGACY);
      return val;
    }
    var val = parseFloat(raw || '1000');
    if (raw === null) localStorage.setItem(key, '1000');
    return val;
  }

  function saveCoinsToStorage(val) {
    var key = getCoinsStorageKey();
    if (!key) return;
    localStorage.setItem(key, String(val));
    updateCoinsDisplay(val);
  }

  function getCoins() {
    return loadCoinsFromStorage();
  }

  function setCoins(val) {
    saveCoinsToStorage(val);
  }

  function getSnipesEl() {
    return document.getElementById('snipes');
  }

  function loadSnipesFromStorage() {
    var key = getSnipesStorageKey();
    if (!key) return 0;
    return parseInt(localStorage.getItem(key) || '0', 10);
  }

  function saveSnipesToStorage(val) {
    var key = getSnipesStorageKey();
    if (!key) return;
    localStorage.setItem(key, String(Math.max(0, val)));
    var el = getSnipesEl();
    if (el) el.textContent = Math.max(0, val);
  }

  function getSnipes() {
    return loadSnipesFromStorage();
  }

  function setSnipes(val) {
    saveSnipesToStorage(val);
  }

  function useSnipe() {
    var n = getSnipes();
    if (n < 1) return false;
    saveSnipesToStorage(n - 1);
    return true;
  }

  function buySnipesWithCoins(amount, costInCoins) {
    var coins = getCoins();
    if (coins < costInCoins) return false;
    setCoins(coins - costInCoins);
    setSnipes(getSnipes() + amount);
    return true;
  }

  function updateSnipesDisplay(val) {
    var el = getSnipesEl();
    if (el) el.textContent = Math.max(0, val || 0);
  }

  function initSnipes() {
    updateSnipesDisplay(loadSnipesFromStorage());
  }

  function refreshSnipes() {
    updateSnipesDisplay(loadSnipesFromStorage());
  }

  function handlePaymentSuccess() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;
    var stored = loadCoinsFromStorage();
    updateCoinsDisplay(stored);
    window.history.replaceState({}, '', window.location.pathname);
  }

  function initCoins() {
    updateCoinsDisplay(loadCoinsFromStorage());
  }

  var PRICES_EUR = { 5: '5', 10: '10', 15: '15', 20: '20', 25: '25', 50: '50', 100: '100' };

  function payWithCard(amount, ev) {
    var btn = ev && ev.target;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Loading...';
    }
    fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount, userId: getUserId() || 'anon' })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Erreur');
        }
      })
      .catch(function(err) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = (PRICES_EUR[amount] || amount) + '$ PURCHASE';
        }
      });
  }

  function refreshCoins() {
    updateCoinsDisplay(loadCoinsFromStorage());
  }

  window.WitBoutiquePayment = {
    payWithCard: payWithCard,
    initCoins: initCoins,
    initSnipes: initSnipes,
    refreshCoins: refreshCoins,
    refreshSnipes: refreshSnipes,
    handlePaymentSuccess: handlePaymentSuccess,
    loadCoinsFromStorage: loadCoinsFromStorage,
    saveCoinsToStorage: saveCoinsToStorage,
    getCoins: getCoins,
    setCoins: setCoins,
    getSnipes: getSnipes,
    setSnipes: setSnipes,
    useSnipe: useSnipe,
    buySnipesWithCoins: buySnipesWithCoins,
    updateSnipesDisplay: updateSnipesDisplay,
    getUserId: getUserId,
    isLoggedIn: function() { return !!getUserId(); }
  };
})();
