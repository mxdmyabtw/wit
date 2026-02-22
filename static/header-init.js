/**
 * Initialisation header: auth, search, profile modal
 */
(function() {
  function renderAuthArea() {
    var area = document.getElementById('auth-area');
    if (!area) return;
    var user = window.WitAuth && window.WitAuth.getUser();
    if (user) {
      area.innerHTML = '<div class="user-dropdown" id="user-dd" title="Mon profil"><img class="user-avatar" src="' + (user.pdp || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2371717a%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E') + '" alt=""><span class="user-pseudo">' + (user.pseudo || '') + '</span></div>';
      var dd = document.getElementById('user-dd');
      if (dd) dd.addEventListener('click', function() { showProfile(user); });
    } else {
      (window.WitAuth && window.WitAuth.loginGoogle()).then(function() { renderAuthArea(); });
      area.innerHTML = '';
    }
  }

  function showProfile(user) {
    var m = document.getElementById('modal-profile');
    if (!m) return;
    var s = (window.WitAuth && window.WitAuth.getStats()) || {};
    m.querySelector('.profile-pseudo').textContent = user.pseudo || 'Inconnu';
    m.querySelector('.profile-pdp').src = user.pdp || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2371717a%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E';
    m.querySelector('.stat-total').textContent = (s.totalEarned || 0).toFixed(2);
    m.querySelector('.stat-wins').textContent = s.wins || 0;
    m.querySelector('.stat-losses').textContent = s.losses || 0;
    m.querySelector('.stat-matches').textContent = s.matchesPlayed || 0;
    var epic = m.querySelector('.btn-link-epic');
    var disc = m.querySelector('.btn-link-discord');
    if (epic) { epic.classList.toggle('linked', !!user.epicLinked); epic.onclick = function() { (window.WitAuth && window.WitAuth.linkEpic()); }; }
    if (disc) { disc.classList.toggle('linked', !!user.discordLinked); disc.onclick = function() { (window.WitAuth && window.WitAuth.linkDiscord()); }; }
    var logoutBtn = m.querySelector('.btn-logout');
    if (logoutBtn) logoutBtn.onclick = function() { (window.WitAuth && window.WitAuth.logout()); closeProfileModal(); renderAuthArea(); window.location.reload(); };
    m.classList.add('open');
  }

  function closeProfileModal() {
    var m = document.getElementById('modal-profile');
    if (m) m.classList.remove('open');
  }

  function onSearch() {
    var inp = document.getElementById('search-input');
    if (!inp) return;
    var q = (inp.value || '').trim();
    if (!q) return;
    var found = window.WitAuth && window.WitAuth.searchUser(q);
    if (found) showProfile(found);
    else alert('Aucun utilisateur trouve pour "' + q + '"');
  }

  function init() {
    renderAuthArea();
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
