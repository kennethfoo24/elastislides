// Slide picker: tick the slides to present, then present only those.
// Injected into the player by build-player.js (runs after the player script, so
// `slides`, `disabled`, `go` etc. are in scope). A slide that is not ticked is
// "disabled" in the player, and the player's navigation already skips those.
(function () {
  var KEY = 'fs-picked-' + (window.FUCKSLIDES_NAME || 'default');
  var ovGrid = document.getElementById('ov-grid');
  var right = document.querySelector('.ov-header-right');
  if (!ovGrid || !right) return;

  var persist = function () { try { localStorage.setItem(KEY, JSON.stringify(Array.from(disabled))); } catch (_) {} };
  var picked = function () { return slides.filter(function (s) { return !disabled.has(s); }).length; };

  // toolbar in the overview header
  var bar = document.createElement('div');
  bar.className = 'pk-bar';
  bar.innerHTML = '<span class="pk-count"></span>' +
    '<button class="pk-b" data-a="all">Select all</button>' +
    '<button class="pk-b" data-a="none">None</button>' +
    '<button class="pk-go">&#9654; Present selected</button>';
  right.insertBefore(bar, right.firstChild);
  var count = bar.querySelector('.pk-count'), go_ = bar.querySelector('.pk-go');

  var hint = right.querySelector('.ov-hint');
  if (hint) hint.textContent = 'Tick the slides to present · drag to reorder · G or Esc to close';
  var title = document.querySelector('.ov-title');
  if (title) title.textContent = 'Pick slides';
  var navBtn = document.getElementById('btn-overview');
  if (navBtn) {
    navBtn.setAttribute('data-tip', 'Pick slides to present, reorder — G');
    var lb = navBtn.querySelector('.nav-label'); if (lb) lb.textContent = 'Pick';
  }

  var refresh = function () {
    count.textContent = picked() + ' of ' + slides.length + ' selected';
    go_.disabled = picked() === 0;
  };

  // the player's own ⊘ button and our checkboxes both go through toggleDisabled
  var orig = toggleDisabled;
  toggleDisabled = function (slide, thumb) { orig(slide, thumb); persist(); refresh(); };

  // (the player clears iframe.dataset.src once a thumbnail has loaded, so go by position)
  var srcOf = function (thumb) { return slides[parseInt(thumb.dataset.i, 10)]; };
  var setAll = function (on) {
    ovGrid.querySelectorAll('.ov-thumb').forEach(function (t) { var s = srcOf(t); if (s && disabled.has(s) === on) toggleDisabled(s, t); });
  };

  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.pk-b'); if (!b) return;
    setAll(b.dataset.a === 'all');
  });
  go_.addEventListener('click', function () {
    if (!picked()) return;
    closeOverview();
    go(slides.findIndex(function (s) { return !disabled.has(s); }));
    if (!isPresenting()) toggleFullscreen();
  });

  // a checkbox on every thumbnail (they are built lazily, the first time the overview opens)
  var decorate = function (thumb) {
    if (thumb.querySelector('.pk-box')) return;
    var inner = thumb.querySelector('.ov-thumb-inner'), s = srcOf(thumb);
    if (!inner || !s) return;
    var box = document.createElement('button');
    box.className = 'pk-box'; box.type = 'button'; box.setAttribute('aria-label', 'Include in presentation');
    box.innerHTML = '<svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    box.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggleDisabled(srcOf(thumb), thumb); });
    box.addEventListener('mousedown', function (e) { e.stopPropagation(); });
    inner.appendChild(box);
  };
  var scan = function () { ovGrid.querySelectorAll('.ov-thumb').forEach(decorate); };
  new MutationObserver(scan).observe(ovGrid, { childList: true });
  scan();
  refresh();
})();
