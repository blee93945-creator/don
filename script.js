(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const nav = $('#nav'), menu = $('nav'), burger = $('#burger'), toast = $('#toast');

  // Mobile menu
  const setMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('.nav__links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

  // Theme toggle (remembered when storage is available)
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  $('#theme').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  // Scroll state: sticky nav border + back-to-top
  const top = $('#top');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 10);
    top.classList.toggle('show', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // Active nav link
  const links = $$('.nav__links a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  // Reveal on scroll, skill bars and counters
  const countUp = el => {
    const end = +el.dataset.count; let n = 0;
    const tick = () => { n += Math.max(1, end / 40); el.textContent = Math.min(end, Math.round(n)); if (n < end) requestAnimationFrame(tick); };
    tick();
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('in');
    $$('.bar i', el).forEach(b => b.style.width = b.dataset.w + '%');
    $$('[data-count]', el).forEach(countUp);
    io.unobserve(el);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));
  const statsIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { $$('[data-count]', e.target).forEach(countUp); statsIO.disconnect(); }
  }), { threshold: .4 });
  const stats = $('.stats'); if (stats) statsIO.observe(stats);

  // Typing effect
  const words = ['Billiard Player', 'Gamer', 'Future Web Developer'];
  const typed = $('#typed'); let w = 0, c = 0, del = false;
  const type = () => {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1500); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(type, del ? 45 : 90);
  };
  type();

  // Project filter
  $$('.pill').forEach(p => p.addEventListener('click', () => {
    $$('.pill').forEach(x => x.classList.toggle('active', x === p));
    $$('.proj').forEach(card => card.classList.toggle('hide', p.dataset.filter !== 'all' && card.dataset.cat !== p.dataset.filter));
  }));

  // Toast
  let timer;
  const notify = msg => {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 3500);
  };
  $$('[data-soon]').forEach(b => b.addEventListener('click', () => notify('This project link will be available soon.')));

  // Form validation
  const form = $('#form');
  const rules = {
    name: v => v.trim().length >= 2 || 'Enter your name (at least 2 characters).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email like name@example.com.',
    subject: v => v.trim().length >= 3 || 'Enter a subject (at least 3 characters).',
    message: v => v.trim().length >= 10 || 'Write a message of at least 10 characters.'
  };
  const check = f => {
    const res = rules[f.name](f.value);
    f.classList.toggle('invalid', res !== true);
    f.setAttribute('aria-invalid', res !== true);
    f.parentElement.querySelector('.err').textContent = res === true ? '' : res;
    return res === true;
  };
  const fields = $$('input, textarea', form);
  fields.forEach(f => f.addEventListener('blur', () => check(f)));
  fields.forEach(f => f.addEventListener('input', () => f.classList.contains('invalid') && check(f)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = fields.map(check).every(Boolean);
    if (!ok) { fields.find(f => f.classList.contains('invalid')).focus(); return; }
    form.reset();
    notify('Message sent. Thanks for reaching out, Brandon will reply soon.');
  });

  $('#year').textContent = new Date().getFullYear();
})();
