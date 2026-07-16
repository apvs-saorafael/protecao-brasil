/* Proteção Brasil — interações da página */
(function () {
  'use strict';

  var WHATSAPP_NUMERO = '5511916821736';

  /* ---------- Header pill: fundo sólido ao rolar ---------- */
  var siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    var onScroll = function () { siteNav.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Carrossel automático (cotação) ---------- */
  (function () {
    var carrossel = document.querySelector('[data-carousel]');
    if (!carrossel) return;
    var slides = carrossel.querySelectorAll('.c-slide');
    if (slides.length < 2) return;

    var dotsWrap = carrossel.querySelector('.c-dots');
    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.setAttribute('aria-label', 'Ver imagem ' + (i + 1));
        if (i === 0) d.classList.add('is-active');
        d.addEventListener('click', function () { mostrar(i); reiniciar(); });
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    var atual = 0, timer;
    function mostrar(i) {
      slides[atual].classList.remove('is-active');
      if (dots[atual]) dots[atual].classList.remove('is-active');
      atual = (i + slides.length) % slides.length;
      slides[atual].classList.add('is-active');
      if (dots[atual]) dots[atual].classList.add('is-active');
    }
    function proximo() { mostrar(atual + 1); }
    function iniciar() { timer = setInterval(proximo, 4000); }
    function reiniciar() { clearInterval(timer); iniciar(); }
    iniciar();
  })();

  /* ---------- Máscara de telefone (11) 91234-5678 ---------- */
  var telefone = document.getElementById('telefone');
  telefone.addEventListener('input', function () {
    var d = telefone.value.replace(/\D/g, '').slice(0, 11);
    var out = '';
    if (d.length > 0) out = '(' + d.slice(0, 2);
    if (d.length >= 3) out += ') ' + d.slice(2, d.length >= 11 ? 7 : 6);
    if (d.length >= (d.length >= 11 ? 8 : 7)) out += '-' + d.slice(d.length >= 11 ? 7 : 6);
    telefone.value = out;
  });

  /* ---------- Placa em maiúsculas ---------- */
  var placa = document.getElementById('placa');
  placa.addEventListener('input', function () {
    placa.value = placa.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  /* ---------- Envio do formulário via WhatsApp ---------- */
  var form = document.getElementById('form-cotacao');
  var feedback = document.getElementById('form-feedback');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    feedback.textContent = '';
    feedback.className = 'form-feedback';

    var invalidos = [];
    form.querySelectorAll('[required]').forEach(function (campo) {
      campo.classList.remove('invalid');
      if (!campo.value || !campo.value.trim()) {
        campo.classList.add('invalid');
        invalidos.push(campo);
      }
    });

    var digitosTel = telefone.value.replace(/\D/g, '');
    if (digitosTel.length < 10) {
      telefone.classList.add('invalid');
      if (invalidos.indexOf(telefone) === -1) invalidos.push(telefone);
    }

    if (invalidos.length) {
      feedback.textContent = 'Por favor, preencha corretamente os campos destacados.';
      feedback.classList.add('error');
      invalidos[0].focus();
      return;
    }

    var dados = {
      nome: form.nome.value.trim(),
      telefone: telefone.value.trim(),
      estado: form.estado.value,
      modelo: form.modelo.value.trim(),
      placa: placa.value.trim(),
      horario: form.horario.value
    };

    var linhas = [
      'Olá! Gostaria de fazer uma cotação de seguro.',
      '',
      '*Nome:* ' + dados.nome,
      '*Telefone:* ' + dados.telefone,
      '*Estado:* ' + dados.estado,
      '*Modelo:* ' + dados.modelo
    ];
    if (dados.placa) linhas.push('*Placa:* ' + dados.placa);
    if (dados.horario) linhas.push('*Melhor horário para contato:* ' + dados.horario);

    var url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(linhas.join('\n'));
    window.open(url, '_blank', 'noopener');

    feedback.textContent = 'Abrindo o WhatsApp com seus dados... Se não abrir, chame no (11) 91682-1736.';
    feedback.classList.add('success');
    form.reset();
  });

  /* ---------- Depoimentos: carrossel com bolinhas ---------- */
  (function () {
    var track = document.querySelector('.depo-grid');
    var dotsWrap = document.querySelector('.depo-dots');
    if (!track || !dotsWrap) return;
    var cards = track.querySelectorAll('.depo-card');
    if (cards.length < 2) return;

    var dots = [];
    cards.forEach(function (card, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Ver depoimento ' + (i + 1));
      if (i === 0) d.classList.add('is-active');
      d.addEventListener('click', function () {
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
      });
      dotsWrap.appendChild(d);
      dots.push(d);
    });

    var ativo = 0;
    function atualizar() {
      var passo = cards[1].offsetLeft - cards[0].offsetLeft; /* largura do card + gap */
      var i = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / passo)));
      if (i !== ativo && dots[i]) {
        dots[ativo].classList.remove('is-active');
        dots[i].classList.add('is-active');
        ativo = i;
      }
    }
    track.addEventListener('scroll', atualizar, { passive: true });
  })();

  /* ---------- Depoimentos: carrega o vídeo do YouTube só ao clicar ---------- */
  document.querySelectorAll('.yt-facade').forEach(function (facade) {
    facade.addEventListener('click', function () {
      var id = facade.getAttribute('data-yt-id');
      var origin = window.location.protocol === 'http:' || window.location.protocol === 'https:'
        ? '&origin=' + encodeURIComponent(window.location.origin)
        : '';
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0' + origin;
      iframe.title = facade.getAttribute('aria-label') || 'Vídeo do YouTube';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      facade.replaceWith(iframe);
    });
  });

  /* ---------- Remove destaque de erro ao digitar ---------- */
  form.querySelectorAll('input, select').forEach(function (campo) {
    campo.addEventListener('input', function () { campo.classList.remove('invalid'); });
    campo.addEventListener('change', function () { campo.classList.remove('invalid'); });
  });
})();
