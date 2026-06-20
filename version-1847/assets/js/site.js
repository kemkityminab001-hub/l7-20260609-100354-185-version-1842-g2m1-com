(function () {
    function toggleMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
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
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupSearch() {
        var input = document.querySelector('[data-filter-query]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var categorySelect = document.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var empty = document.querySelector('[data-filter-empty]');
        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get('q');
        if (queryParam && input) {
            input.value = queryParam;
        }

        function matches(card) {
            var query = normalize(input ? input.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var category = normalize(categorySelect ? categorySelect.value : '');
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
            var ok = true;
            if (query) {
                ok = ok && text.indexOf(query) !== -1;
            }
            if (type) {
                ok = ok && normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
            }
            if (year) {
                ok = ok && normalize(card.getAttribute('data-year')).indexOf(year) !== -1;
            }
            if (category) {
                ok = ok && normalize(card.getAttribute('data-category')) === category;
            }
            return ok;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var isMatch = matches(card);
                card.style.display = isMatch ? '' : 'none';
                if (isMatch) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, typeSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupPlayer() {
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');
        if (!video || !cover) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var hls = null;
        var ready = false;

        function attach() {
            if (ready || !stream) {
                return;
            }
            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            cover.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    cover.classList.remove('is-hidden');
                });
            }
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
})();
