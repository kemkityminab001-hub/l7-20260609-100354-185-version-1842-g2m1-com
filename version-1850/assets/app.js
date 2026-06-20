(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const show = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const nextSlide = function () {
            show(current + 1);
        };

        const start = function () {
            timer = window.setInterval(nextSlide, 5200);
        };

        const restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        show(0);
        start();
    }

    document.querySelectorAll('[data-scroll-row]').forEach(function (wrap) {
        const row = wrap.querySelector('.scroll-row');
        const left = wrap.querySelector('[data-row-left]');
        const right = wrap.querySelector('[data-row-right]');

        if (!row) {
            return;
        }

        const move = function (direction) {
            const value = direction === 'left' ? -420 : 420;
            row.scrollBy({
                left: value,
                behavior: 'smooth'
            });
        };

        if (left) {
            left.addEventListener('click', function () {
                move('left');
            });
        }

        if (right) {
            right.addEventListener('click', function () {
                move('right');
            });
        }
    });

    document.querySelectorAll('.filter-panel').forEach(function (panel) {
        const area = panel.parentElement;
        const cards = Array.from(area.querySelectorAll('.searchable-card'));
        const keyword = panel.querySelector('[data-movie-search]');
        const year = panel.querySelector('[data-filter-year]');
        const region = panel.querySelector('[data-filter-region]');
        const type = panel.querySelector('[data-filter-type]');
        const genre = panel.querySelector('[data-filter-genre]');

        const apply = function () {
            const word = keyword ? keyword.value.trim().toLowerCase() : '';
            const yearValue = year ? year.value : '';
            const regionValue = region ? region.value : '';
            const typeValue = type ? type.value : '';
            const genreValue = genre ? genre.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                const searchText = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.year
                ].join(' ').toLowerCase();

                const matchedWord = !word || searchText.includes(word);
                const matchedYear = !yearValue || card.dataset.year === yearValue;
                const matchedRegion = !regionValue || card.dataset.region === regionValue;
                const matchedType = !typeValue || card.dataset.type === typeValue;
                const matchedGenre = !genreValue || (card.dataset.genre || '').toLowerCase().includes(genreValue);

                card.hidden = !(matchedWord && matchedYear && matchedRegion && matchedType && matchedGenre);
            });
        };

        [keyword, year, region, type, genre].forEach(function (control) {
            if (!control) {
                return;
            }

            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
    });
})();
