(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileNavigation() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initHeroCarousel() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function setActive(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
                dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setActive(activeIndex + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setActive(index);
                start();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                setActive(activeIndex - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setActive(activeIndex + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        setActive(0);
        start();
    }

    function initSearchAndFilters() {
        var searchInput = document.querySelector('[data-search-input]');
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var countNode = document.querySelector('[data-search-count]');
        var activeFilter = 'all';

        if (!cards.length) {
            return;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : '');
            var visibleCount = 0;
            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute('data-search-text'));
                var filterBag = normalize(card.getAttribute('data-filter-bag'));
                var matchesQuery = !query || searchText.indexOf(query) !== -1;
                var matchesFilter = activeFilter === 'all' || filterBag.indexOf(normalize(activeFilter)) !== -1;
                var visible = matchesQuery && matchesFilter;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (countNode) {
                countNode.textContent = String(visibleCount);
            }
            var emptyState = document.querySelector('[data-empty-state]');
            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-value') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilters();
            });
        });

        applyFilters();
    }

    ready(function () {
        initMobileNavigation();
        initHeroCarousel();
        initSearchAndFilters();
    });
})();
