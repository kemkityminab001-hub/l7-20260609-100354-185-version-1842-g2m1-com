(function () {
  function setupMenu() {
    var button = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupSearch() {
    var inputs = document.querySelectorAll('[data-search-input]');
    inputs.forEach(function (input) {
      var scopeSelector = input.getAttribute('data-search-scope');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }
      var cards = scope.querySelectorAll('[data-movie-card]');
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          card.hidden = query && text.indexOf(query) === -1;
        });
      });
    });
  }

  function setupSelectFilter() {
    var selects = document.querySelectorAll('[data-select-filter]');
    selects.forEach(function (select) {
      var scope = document.querySelector(select.getAttribute('data-filter-scope')) || document;
      var cards = scope.querySelectorAll('[data-movie-card]');
      select.addEventListener('change', function () {
        var value = select.value;
        cards.forEach(function (card) {
          var cardValue = card.getAttribute(select.getAttribute('data-filter-key')) || '';
          card.hidden = value !== 'all' && cardValue !== value;
        });
      });
    });
  }

  function bindReady() {
    setupMenu();
    setupSearch();
    setupSelectFilter();
  }

  document.addEventListener('DOMContentLoaded', bindReady);

  globalThis.initMoviePlayer = function (videoId, buttonId, src) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !src) {
      return;
    }
    var loaded = false;
    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (globalThis.Hls && globalThis.Hls.isSupported()) {
        var hls = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }
    function play() {
      load();
      button.classList.add('is-hidden');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }
    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
