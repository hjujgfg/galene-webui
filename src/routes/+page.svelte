<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';
    import LoginForm from '$lib/LoginForm.svelte';
    import VideoGrid from '$lib/VideoGrid.svelte';
    import ChatPanel from '$lib/ChatPanel.svelte';
    import MediaControls from '$lib/MediaControls.svelte';
    import LocalVideo from '$lib/LocalVideo.svelte';
    import UserList from '$lib/UserList.svelte';
    import SettingsSidebar from '$lib/SettingsSidebar.svelte';
</script>

<main>
    {#if !rtc.joined}
        <LoginForm />
    {:else}
        <div class="app-layout">
            <UserList />
            <div class="main-content">
                <VideoGrid />
                <LocalVideo />
                <MediaControls />
            </div>
            <ChatPanel />
            <SettingsSidebar />
        </div>
    {/if}

    {#if rtc.error}
        <div class="error-toast glass">
            {rtc.error}
            <button onclick={() => rtc.error = null}>&times;</button>
        </div>
    {/if}
</main>

<style>
    main {
        height: 100vh;
        width: 100vw;
        background-color: var(--bg-color);
    }
    .app-layout {
        display: flex;
        height: 100%;
        width: 100%;
    }
    .main-content {
        flex: 1;
        overflow: hidden;
        position: relative;
    }
    .error-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem;
        color: #ff5252;
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 1000;
        border: 1px solid rgba(255, 82, 82, 0.3);
    }
    .error-toast button {
        background: transparent;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
    }
</style>
