import { H as Hls } from './hls-module.js';

export function setupVideoPlayer(config) {
    const video = document.getElementById(config.videoId || 'videoPlayer');
    const overlay = document.getElementById(config.overlayId || 'videoOverlay');
    let hlsInstance = null;
    let hasStarted = false;

    if (!video || !config.source) {
        return;
    }

    const startPlayback = () => {
        if (hasStarted) {
            video.play().catch(() => {});
            return;
        }

        hasStarted = true;

        if (overlay) {
            overlay.classList.add('hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.source;
            video.play().catch(() => {});
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(config.source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });
            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
            return;
        }

        video.src = config.source;
        video.play().catch(() => {});
    };

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', () => {
        if (!hasStarted || video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
