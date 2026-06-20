(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('[data-play-toggle]');
        var message = shell.querySelector('[data-player-message]');
        var source = shell.getAttribute('data-source') || (video ? video.getAttribute('data-src') : '');
        var hls = null;
        var loaded = false;

        if (!video || !overlay || !source) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function attachSource() {
            if (loaded) {
                return true;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage('播放源已就绪');
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setMessage('网络波动，正在重新连接');
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setMessage('媒体错误，正在恢复播放');
                        hls.recoverMediaError();
                    } else {
                        setMessage('当前播放源暂时无法播放');
                        hls.destroy();
                    }
                });
                loaded = true;
                return true;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                loaded = true;
                return true;
            }
            setMessage('当前浏览器需要 HLS 播放支持');
            return false;
        }

        function togglePlay() {
            if (!attachSource()) {
                return;
            }
            if (video.paused) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setMessage('点击播放器即可开始播放');
                    });
                }
            } else {
                video.pause();
            }
        }

        overlay.addEventListener('click', togglePlay);
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
            setMessage('正在播放');
        });
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
            setMessage('点击继续播放');
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
            setMessage('播放结束，点击重播');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
    });
})();
