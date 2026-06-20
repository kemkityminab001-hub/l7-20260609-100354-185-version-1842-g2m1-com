
(function () {
    const header = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.menu-toggle');

    if (header && menuToggle) {
        menuToggle.addEventListener('click', function () {
            const isOpen = header.classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const carousel = document.querySelector('.js-hero-carousel');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        let current = 0;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const nextIndex = Number(dot.getAttribute('data-slide')) || 0;
                showSlide(nextIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('.js-search-redirect').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            const query = input.value.trim();
            if (!query) {
                return;
            }
            event.preventDefault();
            window.location.href = './search.html?q=' + encodeURIComponent(query);
        });
    });

    const applySearch = function (scope, query, filter) {
        const cards = Array.from(scope.querySelectorAll('.js-movie-card'));
        const normalizedQuery = query.trim().toLowerCase();
        const normalizedFilter = (filter || 'all').trim().toLowerCase();

        cards.forEach(function (card) {
            const haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
            const matchesQuery = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
            const matchesFilter = normalizedFilter === 'all' || haystack.indexOf(normalizedFilter) !== -1;
            card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
        });
    };

    document.querySelectorAll('.page-section').forEach(function (section) {
        const form = section.querySelector('.js-inline-search');
        const input = form ? form.querySelector('input[type="search"]') : null;
        const filterRow = section.querySelector('.js-filter-row');
        let currentFilter = 'all';

        if (input) {
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q') || '';
            if (query) {
                input.value = query;
                applySearch(section, query, currentFilter);
            }

            input.addEventListener('input', function () {
                applySearch(section, input.value, currentFilter);
            });

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applySearch(section, input.value, currentFilter);
            });
        }

        if (filterRow) {
            filterRow.addEventListener('click', function (event) {
                const button = event.target.closest('.filter-btn');
                if (!button) {
                    return;
                }
                filterRow.querySelectorAll('.filter-btn').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                currentFilter = button.getAttribute('data-filter') || 'all';
                applySearch(section, input ? input.value : '', currentFilter);
            });
        }
    });

    document.querySelectorAll('.js-video-player').forEach(function (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('.video-play-button');

        if (!video || !button) {
            return;
        }

        const loadVideo = function () {
            if (player.dataset.ready === 'true') {
                return;
            }

            const src = video.getAttribute('data-hls');

            if (!src) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                player._hls = hls;
            } else {
                video.src = src;
            }

            player.dataset.ready = 'true';
        };

        const startVideo = function () {
            loadVideo();
            const result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        };

        button.addEventListener('click', startVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                startVideo();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
        });
    });
})();
