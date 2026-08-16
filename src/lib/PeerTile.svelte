<script lang="ts">
    import type { RemoteTrack } from './rtc.svelte';

    let { track }: { track: RemoteTrack } = $props();
    let videoElement: HTMLVideoElement | undefined = $state();

    let isScreenShare = $derived(
        track.stream?.label === 'screenshare' || 
        track.stream?.label === 'screen' || 
        track.label?.includes('(Screen)')
    );

    $effect(() => {
        if (videoElement && track.stream && track.stream.stream) {
            console.log('Attaching stream to video element', track.stream.id);
            videoElement.srcObject = track.stream.stream;
            videoElement.play().catch(e => {
                console.error('Error playing video:', e);
                // Fallback: try muted play if mobile browser blocked unmuted autoplay
                if (videoElement) {
                    videoElement.muted = true;
                    videoElement.play().catch(err => console.error('Muted autoplay also failed:', err));
                }
            });
        }

        return () => {
            if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    });
</script>

<div class="peer-tile glass" class:is-screen={isScreenShare}>
    <video
        bind:this={videoElement}
        autoplay
        playsinline
        muted={false}
        class:contain={isScreenShare}
    >
        <track kind="captions" />
    </video>
    <div class="info">
        <span class="label">{track.label || track.stream.username || track.stream.source || 'Peer'}</span>
    </div>
</div>

<style>
    .peer-tile {
        position: relative;
        aspect-ratio: 16/9;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #000;
        border-radius: 12px;
        width: 100%;
        height: 100%;
    }
    .peer-tile.is-screen {
        border: 1px solid rgba(0, 242, 254, 0.4);
    }
    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    video.contain {
        object-fit: contain;
        background: #050508;
    }
    .info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        color: white;
        font-size: 0.8rem;
    }
    .label {
        font-weight: 600;
    }
</style>
