function initMoviePlayer(videoId, source, overlayId) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);

    if (!video || !source) {
        return;
    }

    let loaded = false;
    let hls = null;

    const attach = function () {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    };

    const start = function () {
        attach();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        const playTask = video.play();

        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
