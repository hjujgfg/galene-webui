<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';

    function toggleCamera() {
        if (!rtc.localUpStream) {
            rtc.startCamera();
        } else {
            rtc.stopCamera();
        }
    }
</script>

<div class="media-controls glass">
    <button 
        class:active={rtc.micEnabled} 
        onclick={() => rtc.toggleMic()}
        disabled={!rtc.localUpStream}
    >
        {#if rtc.micEnabled}
            Mute Mic
        {:else}
            Unmute Mic
        {/if}
    </button>

    <button 
        class:active={rtc.cameraEnabled} 
        onclick={toggleCamera}
    >
        {#if !rtc.localUpStream}
            Start Camera
        {:else}
            Stop Camera
        {/if}
    </button>

    <button 
        class:active={rtc.settingsOpen} 
        onclick={() => rtc.settingsOpen = !rtc.settingsOpen}
    >
        Settings
    </button>

    <button 
        onclick={() => rtc.close()}
        class="disconnect"
    >
        Disconnect
    </button>
</div>

<style>
    .media-controls {
        display: flex;
        gap: 1rem;
        padding: 0.75rem 1.5rem;
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        border-radius: 50px;
    }
    button {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 500;
    }
    button.active {
        background: var(--accent-color);
        color: black;
        box-shadow: var(--accent-glow);
    }
    button.disconnect {
        background: rgba(255, 82, 82, 0.2);
        color: #ff5252;
        border-color: rgba(255, 82, 82, 0.4);
    }
    button.disconnect:hover {
        background: #ff5252;
        color: white;
    }
</style>
