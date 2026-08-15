<script lang="ts">
    import { goto } from '$app/navigation';
    import { rtc } from '$lib/rtc.svelte';

    let copied = $state(false);

    function copyRoomLink() {
        navigator.clipboard.writeText(window.location.href);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }

    function handleDisconnect() {
        rtc.close();
        goto('/');
    }
</script>

<div class="media-controls glass">
    <button 
        class="share-btn"
        onclick={copyRoomLink}
    >
        {copied ? 'Link Copied!' : 'Share Link'}
    </button>

    <button 
        class:active={rtc.micEnabled} 
        onclick={() => rtc.toggleMic()}
    >
        {#if rtc.micEnabled}
            Mute Mic
        {:else}
            Unmute Mic
        {/if}
    </button>

    <button 
        class:active={rtc.cameraEnabled} 
        onclick={() => rtc.toggleCamera()}
    >
        {#if !rtc.localUpStream || !rtc.cameraEnabled}
            Start Camera
        {:else}
            Stop Camera
        {/if}
    </button>
    
    <button 
        class:active={rtc.screenSharing} 
        onclick={() => rtc.toggleScreenShare()}
    >
        {#if rtc.screenSharing}
            Stop Screen
        {:else}
            Share Screen
        {/if}
    </button>
    
    <button 
        class:active={rtc.userListOpen} 
        onclick={() => rtc.userListOpen = !rtc.userListOpen}
    >
        Users
    </button>

    <button 
        class:active={rtc.chatOpen} 
        onclick={() => rtc.chatOpen = !rtc.chatOpen}
    >
        Chat
    </button>

    <button 
        class:active={rtc.settingsOpen} 
        onclick={() => rtc.settingsOpen = !rtc.settingsOpen}
    >
        Settings
    </button>

    <button 
        onclick={handleDisconnect}
        class="disconnect"
    >
        Leave Call
    </button>
</div>

<style>
    .media-controls {
        display: flex;
        gap: 0.75rem;
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
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    button.share-btn {
        background: rgba(0, 242, 254, 0.15);
        color: var(--accent-color, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.4);
    }
    button.share-btn:hover {
        background: rgba(0, 242, 254, 0.3);
    }
    button.active {
        background: var(--accent-color, #00f2fe);
        color: black;
        box-shadow: var(--accent-glow);
    }
    button.disconnect {
        background: rgba(255, 82, 82, 0.2);
        color: #ff5252;
        border: 1px solid rgba(255, 82, 82, 0.4);
    }
    button.disconnect:hover {
        background: #ff5252;
        color: white;
    }
</style>
