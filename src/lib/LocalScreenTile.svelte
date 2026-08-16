<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';

    let videoElement: HTMLVideoElement | undefined = $state();

    $effect(() => {
        if (videoElement && rtc.screenUpStream && rtc.screenUpStream.stream) {
            videoElement.srcObject = rtc.screenUpStream.stream;
            videoElement.play().catch(e => console.error('Error playing screen preview:', e));
        }

        return () => {
            if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    });
</script>

{#if rtc.screenUpStream}
    <div class="screen-tile glass">
        <video
            bind:this={videoElement}
            autoplay
            playsinline
            muted
        >
            <track kind="captions" />
        </video>
        <div class="info">
            <span class="label">You are presenting your screen</span>
            <button class="stop-btn" onclick={() => rtc.stopScreenShare()}>Stop presenting</button>
        </div>
    </div>
{/if}

<style>
    .screen-tile {
        position: relative;
        width: 100%;
        height: 100%;
        aspect-ratio: 16/9;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #09090d;
        border-radius: 12px;
        border: 1px solid rgba(0, 242, 254, 0.4);
    }
    video {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px 16px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .label {
        font-weight: 600;
        color: var(--accent-color, #00f2fe);
    }
    .stop-btn {
        background: #ff5252;
        color: white;
        border: none;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
    }
</style>
