<script lang="ts">
    import type { RemoteTrack } from './rtc.svelte';

    let { track }: { track: RemoteTrack } = $props();
    let videoElement: HTMLVideoElement | undefined = $state();

    $effect(() => {
        if (videoElement && track.stream && track.stream.stream) {
            console.log('Attaching stream to video element', track.stream.id);
            videoElement.srcObject = track.stream.stream;
            videoElement.play().catch(e => console.error('Error playing video:', e));
        }

        return () => {
            if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    });
</script>

<div class="peer-tile glass">
    <video
        bind:this={videoElement}
        autoplay
        playsinline
        muted={false}
    >
        <track kind="captions" />
    </video>
    <div class="info">
        <span class="label">{track.stream.username || track.stream.source || 'Peer'}</span>
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
    }
    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 0.8rem;
    }
    .label {
        font-weight: 600;
    }
</style>
