<script lang="ts">
    import { page } from '$app/stores';
    import { fly } from 'svelte/transition';
    import { rtc } from '$lib/rtc.svelte';
    import LoginForm from '$lib/LoginForm.svelte';
    import VideoGrid from '$lib/VideoGrid.svelte';
    import ChatPanel from '$lib/ChatPanel.svelte';
    import MediaControls from '$lib/MediaControls.svelte';
    import LocalVideo from '$lib/LocalVideo.svelte';
    import UserList from '$lib/UserList.svelte';
    import SettingsSidebar from '$lib/SettingsSidebar.svelte';

    let groupParam = $derived($page.params.group);
</script>

<svelte:head>
    <title>Meeting: {groupParam} | Galène WebUI</title>
</svelte:head>

<main>
    {#if !rtc.joined}
        <LoginForm initialGroup={groupParam} />
    {:else}
        <div class="app-layout">
            {#if rtc.userListOpen}
                <div transition:fly={{ x: -300, duration: 300 }} class="panel-wrapper">
                    <UserList />
                </div>
            {/if}
            
            <div class="main-content">
                <VideoGrid />
                <LocalVideo />
                <MediaControls />
            </div>

            {#if rtc.chatOpen}
                <div transition:fly={{ x: 300, duration: 300 }} class="panel-wrapper">
                    <ChatPanel />
                </div>
            {/if}
            
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
        overflow: hidden;
    }
    .panel-wrapper {
        height: 100%;
        z-index: 10;
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
