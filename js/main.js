(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- scroll progress + nav state ---------- */
  var progressEl = document.getElementById('scrollProgress');
  var nav = document.getElementById('nav');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressEl) progressEl.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', y > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- typewriter headline ---------- */
  var typedEl = document.getElementById('typedText');
  if (typedEl && !reduced) {
    var words = [];
    try { words = JSON.parse(typedEl.getAttribute('data-words')) || []; } catch (e) { words = []; }
    var wi = 0, ci = 0, deleting = false;

    function tick() {
      if (!words.length) return;
      var word = words[wi];
      ci += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, ci);

      var delay = deleting ? 45 : 85;
      if (!deleting && ci === word.length) { delay = 1600; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }

      setTimeout(tick, delay);
    }
    setTimeout(tick, 900);
  } else if (typedEl && reduced) {
    try {
      var w = JSON.parse(typedEl.getAttribute('data-words'));
      if (w && w.length) typedEl.textContent = w[0];
    } catch (e) {}
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- mock github contribution graph ---------- */
  var graph = document.getElementById('ghGraph');
  if (graph) {
    var weeks = 18, levels = ['l0', 'l0', 'l1', 'l2', 'l2', 'l3', 'l4'];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < weeks * 7; i++) {
      // pseudo-random but seeded-ish distribution for a natural look
      var r = Math.random();
      var lvl = r < 0.32 ? 'l0' : r < 0.55 ? 'l1' : r < 0.74 ? 'l2' : r < 0.9 ? 'l3' : 'l4';
      var cell = document.createElement('span');
      cell.className = 'cell ' + lvl;
      cell.title = Math.floor(Math.random() * 12) + ' contributions';
      frag.appendChild(cell);
    }
    graph.appendChild(frag);
    if ('IntersectionObserver' in window && !reduced) {
      var cells = graph.querySelectorAll('.cell');
      var gio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          cells.forEach(function (c, idx) {
            c.style.opacity = '0';
            c.style.transform = 'scale(.4)';
            setTimeout(function () {
              c.style.transition = 'opacity .4s ease, transform .4s cubic-bezier(0.34,1.56,0.64,1)';
              c.style.opacity = '1';
              c.style.transform = 'scale(1)';
            }, idx * 6);
          });
          gio.disconnect();
        }
      }, { threshold: 0.2 });
      gio.observe(graph);
    }
  }

  /* ---------- magnetic buttons ---------- */
  if (!touch && !reduced) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.22 + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- subtle 3D tilt on cards ---------- */
  if (!touch && !reduced) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
        card.style.transform = 'perspective(1100px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- terminal boot typing ---------- */
  var termBody = document.getElementById('termBody');
  if (termBody && !reduced && 'IntersectionObserver' in window) {
    var lines = Array.prototype.slice.call(termBody.children);
    var tio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        lines.forEach(function (line, idx) {
          line.style.opacity = '0';
          setTimeout(function () {
            line.style.transition = 'opacity .35s ease';
            line.style.opacity = '1';
          }, idx * 420);
        });
        tio.disconnect();
      }
    }, { threshold: 0.3 });
    tio.observe(termBody);
  }

  /* ---------- contact form fake terminal response ---------- */
  var form = document.getElementById('pingForm');
  var resp = document.getElementById('termResp');
  if (form && resp) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name="name"]') || {}).value || 'friend';
      resp.textContent = '';
      var msg = '[ok] packet received from ' + name.trim() + ' — will reply soon ✔';
      if (reduced) { resp.textContent = msg; return; }
      var i = 0;
      (function type() {
        resp.textContent = msg.slice(0, ++i);
        if (i < msg.length) setTimeout(type, 24);
      })();
      form.reset();
    });
  }

  /* ---------- smooth anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        var navH = nav ? nav.offsetHeight : 0;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset - navH - 16,
          behavior: reduced ? 'auto' : 'smooth'
        });
      }
    });
  });

  console.log('%c◆ jubayer.dev — systems · security · AI', 'color:#8b5cf6;font-weight:bold;');
})();
