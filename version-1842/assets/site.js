(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function(form) {
        form.addEventListener('submit', function(event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                window.location.href = './movies.html';
            }
        });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function(slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                show(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function() {
                show(active + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('.js-card-filter').forEach(function(panel) {
        var section = panel.closest('section') || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');

        function applyFilter() {
            var q = keyword ? keyword.value.trim().toLowerCase() : '';
            var typeValue = type ? type.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value.trim() : '';

            cards.forEach(function(card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var ok = true;

                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (typeValue && cardType.indexOf(typeValue) === -1) {
                    ok = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    ok = false;
                }

                card.classList.toggle('is-hidden', !ok);
            });
        }

        [keyword, type, year].forEach(function(control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    document.querySelectorAll('[data-player]').forEach(function(frame) {
        var video = frame.querySelector('video');
        var button = frame.querySelector('[data-play-button]');
        var stream = frame.getAttribute('data-stream');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !video || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            attached = true;
        }

        function start() {
            attach();
            frame.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {});
            }
        }

        if (button && video) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function() {
                frame.classList.add('is-playing');
            });
            video.addEventListener('ended', function() {
                frame.classList.remove('is-playing');
            });
        }

        window.addEventListener('pagehide', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
