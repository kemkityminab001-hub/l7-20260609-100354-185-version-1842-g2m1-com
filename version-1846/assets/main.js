document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupPageFilters();
  setupSearchPage();
  setupPlayers();
});

function setupMobileMenu() {
  var button = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var previous = hero.querySelector('[data-hero-prev]');
  var next = hero.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  if (slides.length <= 1) {
    return;
  }

  function showSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      start();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var dotIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(dotIndex);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function setupPageFilters() {
  var inputs = Array.prototype.slice.call(document.querySelectorAll('.js-filter-input'));

  inputs.forEach(function (input) {
    var section = input.closest('section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
    var count = section.querySelector('[data-filter-count]');

    function applyFilter() {
      var query = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matches = !query || text.indexOf(query) !== -1;
        card.classList.toggle('hidden-by-filter', !matches);

        if (matches) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = query ? '筛选结果：' + visible + ' 条' : '当前显示：' + cards.length + ' 条';
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });
}

function setupSearchPage() {
  var input = document.querySelector('[data-site-search]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');

  if (!input || !results || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  function render(list) {
    results.innerHTML = list.map(function (movie) {
      return buildSearchCard(movie);
    }).join('');
  }

  function performSearch() {
    var query = normalize(input.value);
    var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      return !query || normalize(movie.searchText).indexOf(query) !== -1;
    }).slice(0, 120);

    if (summary) {
      summary.textContent = query
        ? '找到 ' + list.length + ' 条相关结果，最多显示前 120 条。'
        : '输入关键词后可检索完整片库，默认展示前 24 条。';
    }

    render(query ? list : window.MOVIE_SEARCH_DATA.slice(0, 24));
  }

  input.addEventListener('input', performSearch);
  performSearch();
}

function buildSearchCard(movie) {
  return [
    '<article class="movie-card movie-card-compact" data-card>',
    '  <a class="movie-card-cover" href="./' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
    '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '    <span class="corner-pill">' + escapeHtml(movie.category) + '</span>',
    '  </a>',
    '  <div class="movie-card-body">',
    '    <h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
    '    <p>' + escapeHtml(movie.oneLine) + '</p>',
    '    <div class="movie-meta-line">',
    '      <span>' + escapeHtml(movie.type) + '</span>',
    '      <span>' + escapeHtml(movie.region) + '</span>',
    '      <span>' + escapeHtml(movie.year) + '</span>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('');
}

function setupPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.js-play-button');
    var sourceButtons = Array.prototype.slice.call(document.querySelectorAll('.js-source-button'));
    var currentHls = null;

    if (!video || !overlay) {
      return;
    }

    function loadSource(sourceUrl, autoplay) {
      if (!sourceUrl) {
        return;
      }

      if (currentHls && typeof currentHls.destroy === 'function') {
        currentHls.destroy();
        currentHls = null;
      }

      if (window.Hls && window.Hls.isSupported()) {
        currentHls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        currentHls.loadSource(sourceUrl);
        currentHls.attachMedia(video);
        currentHls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (autoplay) {
            video.play().catch(function () {});
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        if (autoplay) {
          video.play().catch(function () {});
        }
      } else {
        video.src = sourceUrl;
        if (autoplay) {
          video.play().catch(function () {});
        }
      }
    }

    overlay.addEventListener('click', function () {
      overlay.classList.add('is-hidden');
      loadSource(overlay.getAttribute('data-m3u8'), true);
    });

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sourceButtons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        overlay.setAttribute('data-m3u8', button.getAttribute('data-m3u8'));
        overlay.classList.add('is-hidden');
        loadSource(button.getAttribute('data-m3u8'), true);
      });
    });
  });
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[character];
  });
}
