(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;

        const showSlide = (index) => {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        if (slides.length > 1) {
            window.setInterval(() => showSlide(activeIndex + 1), 6500);
        }
    }

    const filterList = document.querySelector('[data-filterable-list]');

    if (filterList) {
        const input = document.querySelector('.page-filter-input');
        const selects = Array.from(document.querySelectorAll('.page-filter-select'));
        const items = Array.from(filterList.querySelectorAll('[data-title]'));

        const fillSelect = (select, values) => {
            values.forEach((value) => {
                if (!value) {
                    return;
                }
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        };

        selects.forEach((select) => {
            const field = select.dataset.filter;
            const values = Array.from(new Set(items.map((item) => item.dataset[field]).filter(Boolean))).sort((a, b) => b.localeCompare(a, 'zh-Hans-CN'));
            fillSelect(select, values);
        });

        const applyFilters = () => {
            const query = input ? input.value.trim().toLowerCase() : '';
            const selected = {};
            selects.forEach((select) => {
                selected[select.dataset.filter] = select.value;
            });
            items.forEach((item) => {
                const text = [item.dataset.title, item.dataset.region, item.dataset.type, item.dataset.year, item.dataset.keywords].join(' ').toLowerCase();
                const matchQuery = !query || text.includes(query);
                const matchSelects = Object.entries(selected).every(([field, value]) => !value || item.dataset[field] === value);
                item.hidden = !(matchQuery && matchSelects);
            });
        };

        if (input) {
            input.addEventListener('input', applyFilters);
        }
        selects.forEach((select) => select.addEventListener('change', applyFilters));
    }

    const searchForm = document.querySelector('[data-search-form]');
    const searchResults = document.querySelector('[data-search-results]');

    if (searchForm && searchResults && window.STATIC_MOVIE_INDEX) {
        const queryInput = searchForm.querySelector('input[name="q"]');
        const categorySelect = searchForm.querySelector('select[name="category"]');
        const yearSelect = searchForm.querySelector('select[name="year"]');
        const params = new URLSearchParams(window.location.search);

        const categories = window.STATIC_MOVIE_CATEGORIES || [];
        const years = Array.from(new Set(window.STATIC_MOVIE_INDEX.map((item) => item.year))).sort((a, b) => b.localeCompare(a, 'zh-Hans-CN'));

        categories.forEach((category) => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        years.forEach((year) => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        queryInput.value = params.get('q') || '';
        categorySelect.value = params.get('category') || '';
        yearSelect.value = params.get('year') || '';

        const render = () => {
            const query = queryInput.value.trim().toLowerCase();
            const category = categorySelect.value;
            const year = yearSelect.value;
            const results = window.STATIC_MOVIE_INDEX.filter((item) => {
                const text = [item.title, item.region, item.type, item.year, item.category, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase();
                return (!query || text.includes(query)) && (!category || item.category === category) && (!year || item.year === year);
            }).slice(0, 80);

            if (!results.length) {
                searchResults.innerHTML = '<p class="empty-state">没有找到匹配内容，请调整关键词后再试。</p>';
                return;
            }

            searchResults.innerHTML = results.map((item) => `
                <article class="search-result-card">
                    <a class="search-cover" href="${item.url}">
                        <img src="./${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy">
                    </a>
                    <div>
                        <h2><a href="${item.url}">${escapeHtml(item.title)}</a></h2>
                        <p>${escapeHtml(item.oneLine)}</p>
                        <div>${escapeHtml(item.region)} · ${escapeHtml(item.type)} · ${escapeHtml(item.year)} · <a href="category/${item.categorySlug}.html">${escapeHtml(item.category)}</a></div>
                    </div>
                </article>
            `).join('');
        };

        const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));

        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const next = new URLSearchParams();
            if (queryInput.value.trim()) {
                next.set('q', queryInput.value.trim());
            }
            if (categorySelect.value) {
                next.set('category', categorySelect.value);
            }
            if (yearSelect.value) {
                next.set('year', yearSelect.value);
            }
            const url = `${window.location.pathname}${next.toString() ? `?${next.toString()}` : ''}`;
            window.history.replaceState({}, '', url);
            render();
        });

        queryInput.addEventListener('input', render);
        categorySelect.addEventListener('change', render);
        yearSelect.addEventListener('change', render);
        render();
    }
})();
