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
    var val = parseFloat(localStorage.getItem(key) || '0');
    if (val === 0 && localStorage.getItem(STORAGE_COINS_LEGACY)) {
      val = parseFloat(localStorage.getItem(STORAGE_COINS_LEGACY) || '0');
      localStorage.setItem(key, String(val));
      localStorage.removeItem(STORAGE_COINS_LEGACY);
    }
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
    refreshCoins: refreshCoins,
    handlePaymentSuccess: handlePaymentSuccess,
    loadCoinsFromStorage: loadCoinsFromStorage,
    saveCoinsToStorage: saveCoinsToStorage,
    updateCoinsDisplay: updateCoinsDisplay,
    getCoins: getCoins,
    setCoins: setCoins,
    getUserId: getUserId,
    isLoggedIn: function() { return !!getUserId(); }
  };
})();
