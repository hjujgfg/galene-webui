<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { rtc } from '$lib/rtc.svelte';

    let username = $state('');
    let password = $state('');
    let group = $state('public');
    let loading = $state(false);
    
    let videoPreview: HTMLVideoElement | undefined = $state();

    onMount(async () => {
        // Default to both enabled for preview
        await rtc.startPreview(true, true);
    });

    onDestroy(() => {
        // If we haven't joined yet, stop the preview stream to release hardware
        if (!rtc.joined) {
            rtc.stopPreview();
        }
    });

    $effect(() => {
        if (videoPreview && rtc.previewStream) {
            videoPreview.srcObject = rtc.previewStream;
        }
    });

    async function handleLogin() {
        loading = true;
        const finalUsername = username || `user_${Math.floor(Math.random() * 1000)}`;

        try {
            await rtc.connect(rtc.endpoint);
            // Join FIRST so the server knows who we are
            await rtc.join(group, finalUsername, { type: 'password', password });
            // Now start/adopt the local stream
            await rtc.startLocalStream(rtc.micEnabled, rtc.cameraEnabled);
        } catch (e: any) {
            console.error('Login failed:', e);
            rtc.error = e.message || e.toString();
        } finally {
            loading = false;
        }
    }
</script>

<div class="login-page">
    <div class="preview-container glass">
        <div class="video-preview">
            {#if rtc.cameraEnabled && rtc.previewStream}
                <video bind:this={videoPreview} autoplay playsinline muted></video>
            {:else}
                <div class="placeholder">
                    <div class="avatar">
                        {username ? username[0].toUpperCase() : '?'}
                    </div>
                    <p>Camera is off</p>
                </div>
            {/if}
            
            <div class="preview-controls">
                <button 
                    type="button"
                    class="control-btn" 
                    class:active={rtc.micEnabled}
                    onclick={() => rtc.togglePreviewMic()}
                >
                    {rtc.micEnabled ? 'Mic On' : 'Mic Off'}
                </button>
                <button 
                    type="button"
                    class="control-btn" 
                    class:active={rtc.cameraEnabled}
                    onclick={() => rtc.togglePreviewCamera()}
                >
                    {rtc.cameraEnabled ? 'Camera On' : 'Camera Off'}
                </button>
            </div>
        </div>
    </div>

    <div class="login-container glass">
        <form onsubmit={handleLogin}>
            <div class="header">
                <img src="/src/lib/assets/favicon.svg" alt="Galene" class="logo" />
                <h2>Join Galène</h2>
            </div>
            
            <div class="field">
                <label for="group">Group Name</label>
                <input id="group" bind:value={group} disabled={loading} placeholder="e.g. public" />
            </div>
            
            <div class="field">
                <label for="username">Your Name</label>
                <input id="username" bind:value={username} disabled={loading} placeholder="Username" />
            </div>
            
            <div class="field">
                <label for="password">Password (optional)</label>
                <input id="password" type="password" bind:value={password} disabled={loading} placeholder="••••••••" />
            </div>

            <button type="submit" class="submit-btn" disabled={loading}>
                {loading ? 'Connecting...' : 'Join Meeting'}
            </button>
        </form>
    </div>
</div>

<style>
    .login-page {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        height: 100vh;
        width: 100vw;
        padding: 2rem;
        box-sizing: border-box;
    }

    .preview-container {
        flex: 1;
        max-width: 640px;
        aspect-ratio: 16/9;
        overflow: hidden;
        position: relative;
        border-radius: 12px;
    }

    .video-preview {
        width: 100%;
        height: 100%;
        background: #1a1a1f;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scaleX(-1);
    }

    .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .avatar {
        width: 80px;
        height: 80px;
        background: var(--accent-color);
        color: black;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 700;
    }

    .preview-controls {
        position: absolute;
        bottom: 1.5rem;
        display: flex;
        gap: 1rem;
    }

    .control-btn {
        padding: 0.6rem 1.2rem;
        border-radius: 30px;
        font-size: 0.9rem;
        font-weight: 600;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .control-btn.active {
        background: var(--accent-color);
        color: black;
        border-color: var(--accent-color);
    }

    .login-container {
        padding: 2.5rem;
        width: 100%;
        max-width: 380px;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .logo {
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .field label {
        font-size: 0.85rem;
        font-weight: 500;
        opacity: 0.8;
    }

    h2 {
        margin: 0;
        color: var(--accent-color);
        letter-spacing: -0.02em;
    }

    .submit-btn {
        margin-top: 0.5rem;
        padding: 0.75rem;
        font-size: 1rem;
        background: var(--accent-color);
        color: black;
        border: none;
        font-weight: 600;
    }

    @media (max-width: 900px) {
        .login-page {
            flex-direction: column;
            overflow-y: auto;
            height: auto;
            padding: 1rem;
        }
        .preview-container {
            width: 100%;
            max-width: 100%;
        }
    }
</style>
