(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var next = root.querySelector("[data-hero-next]");
        var prev = root.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (slides.length === 0) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function uniqueValues(items, name) {
        var values = [];
        items.forEach(function (item) {
            var value = item.getAttribute("data-" + name) || "";
            value = value.trim();
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return a.localeCompare(b, "zh-Hans-CN");
        });
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var section = panel.closest(".listing-section") || document;
            var list = section.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var items = Array.prototype.slice.call(list.querySelectorAll(".filter-item"));
            var search = panel.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));
            var clear = panel.querySelector("[data-clear-filter]");
            var empty = panel.querySelector("[data-empty-state]");

            selects.forEach(function (select) {
                var field = select.getAttribute("data-filter-field");
                if (!field) {
                    return;
                }
                var values = uniqueValues(items, field);
                values.forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            });

            function apply() {
                var keyword = search ? search.value.trim().toLowerCase() : "";
                var visible = 0;
                items.forEach(function (item) {
                    var text = (item.getAttribute("data-title") || "").toLowerCase();
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchSelects = selects.every(function (select) {
                        var field = select.getAttribute("data-filter-field");
                        var value = select.value;
                        if (!value) {
                            return true;
                        }
                        return (item.getAttribute("data-" + field) || "") === value;
                    });
                    var matched = matchKeyword && matchSelects;
                    item.classList.toggle("is-hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (search) {
                search.addEventListener("input", apply);
                var query = new URLSearchParams(window.location.search).get("q");
                if (query) {
                    search.value = query;
                }
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            if (clear) {
                clear.addEventListener("click", function () {
                    if (search) {
                        search.value = "";
                    }
                    selects.forEach(function (select) {
                        select.value = "";
                    });
                    apply();
                });
            }
            apply();
        });
    }

    window.setupMoviePlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = null;
        var ready = false;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
