(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFiltering();
    setupImages();
    setupPlayers();
  });

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupFiltering() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }

    var items = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (query) {
      input.value = query;
    }

    function applyFilter(value) {
      var keyword = String(value || "").trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var haystack = String(item.getAttribute("data-search") || "").toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        item.classList.toggle("is-hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", function () {
      applyFilter(input.value);
    });

    document.querySelectorAll("[data-filter-value]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-filter-value") || "";
        applyFilter(input.value);
      });
    });

    applyFilter(input.value);
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-player-start]");
      var source = shell.getAttribute("data-hls-url");
      var hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      function start() {
        button.classList.add("is-hidden");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          video.play().catch(function () {
            /* The user can still press the native control after the source is ready. */
          });
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              button.classList.remove("is-hidden");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = source;
            }
          });
        } else {
          video.src = source;
          video.play().catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", start);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
    });
  }
})();
