<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';

    let videoElement: HTMLVideoElement | undefined = $state();

    $effect(() => {
        if (videoElement && rtc.localUpStream) {
            videoElement.srcObject = rtc.localUpStream.stream;
        }

        return () => {
            if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    });
</script>

{#if rtc.localUpStream}
    <div class="local-video glass">
        <video
            bind:this={videoElement}
            autoplay
            playsinline
            muted
        >
            <track kind="captions" />
        </video>
        <div class="info">You (Local)</div>
    </div>
{/if}

<style>
    .local-video {
        position: fixed;
        bottom: 2rem;
        right: 320px; /* offset from chat panel */
        width: 240px;
        aspect-ratio: 16/9;
        overflow: hidden;
        border-radius: 12px;
        z-index: 90;
        background: #000;
        border: var(--glass-border);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
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
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 0.7rem;
        text-align: center;
    }
</style>
