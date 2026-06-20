(function() {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var form = document.querySelector('[data-search-page-form]');
    var input = form ? form.querySelector('input[name="q"]') : null;
    var title = document.querySelector('[data-search-title]');
    var resultBox = document.querySelector('[data-search-results]');
    var movies = window.SEARCH_MOVIES || [];

    if (input) {
        input.value = q;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function(char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderCard(movie) {
        return [
            '<article class="movie-card">',
            '<a href="' + escapeHtml(movie.url) + '" class="card-link" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
            '<div class="poster-wrap">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
            '<span class="poster-play">▶</span>',
            '</div>',
            '<div class="card-body">',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
            '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-foot"><span>高清</span><em>' + escapeHtml(movie.genre) + '</em></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function search() {
        if (!resultBox || !q) {
            return;
        }

        var key = q.toLowerCase();
        var results = movies.filter(function(movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
            return text.indexOf(key) !== -1;
        }).slice(0, 180);

        if (title) {
            title.textContent = '搜索结果';
        }

        if (results.length) {
            resultBox.innerHTML = results.map(renderCard).join('');
        } else {
            resultBox.innerHTML = '<div class="search-empty">暂无匹配结果，可更换关键词继续搜索。</div>';
        }
    }

    search();
})();
