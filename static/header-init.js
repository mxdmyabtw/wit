/**
 * Initialisation header: auth, search, profile modal
 */
(function() {
  function renderAuthArea() {
    var area = document.getElementById('auth-area');
    if (!area) return;
    var user = window.WitAuth && window.WitAuth.getUser();
    if (user) {
      area.innerHTML = '<div class="user-dropdown" id="user-dd" title="My profile"><img class="user-avatar" src="' + (user.pdp || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2371717a%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E') + '" alt=""><span class="user-pseudo">' + (user.pseudo || '') + '</span></div>';
      var dd = document.getElementById('user-dd');
      if (dd) dd.addEventListener('click', function() { showProfile(user); });
    } else {
      (window.WitAuth && window.WitAuth.login && window.WitAuth.login()).then(function() {
        renderAuthArea();
        if (window.WitBoutiquePayment && window.WitBoutiquePayment.refreshCoins) window.WitBoutiquePayment.refreshCoins();
      });
      area.innerHTML = '';
    }
  }

  var defaultPdpSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2371717a%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E';

  function showProfile(user, options) {
    options = options || {};
    var m = document.getElementById('modal-profile');
    if (!m) return;
    var currentUser = window.WitAuth && window.WitAuth.getUser();
    var isOwn = currentUser && user && currentUser.id === user.id;
    var readOnly = !!options.readOnly || !isOwn;
    m.classList.toggle('read-only', readOnly);
    var s = readOnly ? {} : (window.WitAuth && window.WitAuth.getStats()) || {};
    m.querySelector('.profile-pseudo').textContent = user.pseudo || 'Unknown';
    var pseudoInput = m.querySelector('#profile-pseudo-input');
    var pseudoBtn = m.querySelector('#profile-pseudo-btn');
    if (pseudoInput) pseudoInput.value = '';
    if (pseudoBtn) {
      pseudoBtn.onclick = function() {
        var p = (pseudoInput && pseudoInput.value || '').trim().slice(0, 20);
        if (!p || p.length < 2) { alert('Pseudo minimum 2 caracteres.'); return; }
        if (window.WitAuth && window.WitAuth.setPseudo) {
          if (window.WitAuth.setPseudo(p)) {
            m.querySelector('.profile-pseudo').textContent = p;
            pseudoInput.value = '';
            renderAuthArea();
          } else {
            alert('Ce pseudo est deja utilise.');
          }
        }
      };
    }
    if (pseudoInput) pseudoInput.onkeypress = function(e) { if (e.key === 'Enter') pseudoBtn && pseudoBtn.click(); };
    var pdpImg = m.querySelector('.profile-pdp');
    pdpImg.src = user.pdp || defaultPdpSvg;
    var dash = '\u2014';
    m.querySelector('.stat-total').textContent = readOnly ? dash : (s.totalEarned || 0).toFixed(2);
    m.querySelector('.stat-wins').textContent = readOnly ? dash : (s.wins || 0);
    m.querySelector('.stat-losses').textContent = readOnly ? dash : (s.losses || 0);
    m.querySelector('.stat-matches').textContent = readOnly ? dash : (s.matchesPlayed || 0);
    var epic = m.querySelector('.btn-link-epic');
    var disc = m.querySelector('.btn-link-discord');
    if (epic) { epic.classList.toggle('linked', !!user.epicLinked); epic.onclick = function() { (window.WitAuth && window.WitAuth.linkEpic()); }; }
    if (disc) { disc.classList.toggle('linked', !!user.discordLinked); disc.onclick = function() { (window.WitAuth && window.WitAuth.linkDiscord()); }; }
    var logoutBtn = m.querySelector('.btn-logout');
    if (logoutBtn) logoutBtn.onclick = function() { (window.WitAuth && window.WitAuth.logout()); closeProfileModal(); renderAuthArea(); window.location.reload(); };
    var pdpWrap = m.querySelector('.profile-pdp-wrap');
    if (pdpWrap) {
      var fileInput = pdpWrap.querySelector('input[type="file"]');
      if (fileInput) {
        pdpWrap.style.cursor = 'pointer';
        pdpWrap.onclick = function() { fileInput.click(); };
        fileInput.onchange = function() {
          var f = fileInput.files && fileInput.files[0];
          if (!f || !f.type.match(/^image\//)) return;
          var r = new FileReader();
          r.onload = function() {
            if (window.WitAuth && window.WitAuth.updatePdp) window.WitAuth.updatePdp(r.result);
            pdpImg.src = r.result;
            renderAuthArea();
          };
          r.readAsDataURL(f);
        };
      }
      pdpWrap.title = 'Click to change photo';
    }
    m.classList.add('open');
  }

  function closeProfileModal() {
    var m = document.getElementById('modal-profile');
    if (m) { m.classList.remove('open'); m.classList.remove('read-only'); }
  }

  window.WitHeaderInit = window.WitHeaderInit || {};
  window.WitHeaderInit.showProfile = showProfile;

  function onSearch() {
    var inp = document.getElementById('search-input');
    if (!inp) return;
    var q = (inp.value || '').trim();
    if (!q) return;
    var found = window.WitAuth && window.WitAuth.searchUser(q);
    if (found) showProfile(found);
  }

  function init() {
    if (window.WitAuth && window.WitAuth.onAuthStateChanged) {
      window.WitAuth.onAuthStateChanged(function() {
        renderAuthArea();
        if (window.WitBoutiquePayment) {
          if (window.WitBoutiquePayment.refreshCoins) window.WitBoutiquePayment.refreshCoins();
          if (window.WitBoutiquePayment.refreshSnipes) window.WitBoutiquePayment.refreshSnipes();
        }
      });
    } else {
      renderAuthArea();
    }
    if (window.WitBoutiquePayment && window.WitBoutiquePayment.initSnipes) {
      window.WitBoutiquePayment.initSnipes();
    }
    var searchInp = document.getElementById('search-input');
    if (searchInp) {
      searchInp.addEventListener('keypress', function(e) { if (e.key === 'Enter') onSearch(); });
    }
    var searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', onSearch);
    document.querySelectorAll('.modal-profile .modal-close').forEach(function(b) { b.onclick = closeProfileModal; });
    var profileOverlay = document.getElementById('modal-profile');
    if (profileOverlay) profileOverlay.addEventListener('click', function(e) { if (e.target === profileOverlay) closeProfileModal(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
