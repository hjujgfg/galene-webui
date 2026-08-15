<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { rtc } from '$lib/rtc.svelte';

    interface Props {
        initialGroup?: string;
    }

    let { initialGroup = 'public' }: Props = $props();

    let username = $state('');
    let password = $state('');
    let group = $state(initialGroup);
    let loading = $state(false);
    let copied = $state(false);
    
    let videoPreview: HTMLVideoElement | undefined = $state();

    $effect(() => {
        if (initialGroup) {
            group = initialGroup;
        }
    });

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

    function copyLink() {
        const url = `${window.location.origin}/${group}`;
        navigator.clipboard.writeText(url);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }

    async function handleLogin() {
        loading = true;
        const finalUsername = username || `user_${Math.floor(Math.random() * 1000)}`;
        const desiredMic = rtc.micEnabled;
        const desiredCamera = rtc.cameraEnabled;

        try {
            await rtc.connect(rtc.endpoint);
            // Join FIRST so the server knows who we are
            await rtc.join(group, finalUsername, { type: 'password', password });
            // Now start/adopt the local stream using our captured choices
            await rtc.startLocalStream(desiredMic, desiredCamera);
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
                <h2>Ready to join?</h2>
                <div class="room-pill">
                    <span>Room: <strong>{group}</strong></span>
                    <button type="button" class="copy-pill-btn" onclick={copyLink}>
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>
            
            <div class="field">
                <label for="username">Your Name</label>
                <input id="username" bind:value={username} disabled={loading} placeholder="Enter your name" required />
            </div>
            
            <div class="field">
                <label for="password">Password (if room is protected)</label>
                <input id="password" type="password" bind:value={password} disabled={loading} placeholder="••••••••" />
            </div>

            <button type="submit" class="submit-btn" disabled={loading}>
                {loading ? 'Joining meeting...' : 'Join Now'}
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
        background: var(--accent-color, #00f2fe);
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
        color: white;
        cursor: pointer;
    }

    .control-btn.active {
        background: var(--accent-color, #00f2fe);
        color: black;
        border-color: var(--accent-color, #00f2fe);
    }

    .login-container {
        padding: 2.5rem;
        width: 100%;
        max-width: 380px;
        border-radius: 16px;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .logo {
        width: 44px;
        height: 44px;
        margin-bottom: 0.5rem;
    }

    .room-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.75rem;
        padding: 0.4rem 0.8rem;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        font-size: 0.85rem;
    }

    .copy-pill-btn {
        background: rgba(0, 242, 254, 0.15);
        color: var(--accent-color, #00f2fe);
        border: 1px solid rgba(0, 242, 254, 0.3);
        border-radius: 12px;
        padding: 0.2rem 0.6rem;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
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

    .field input {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: white;
        font-size: 0.95rem;
    }

    h2 {
        margin: 0;
        color: #fff;
        letter-spacing: -0.02em;
    }

    .submit-btn {
        margin-top: 0.5rem;
        padding: 0.85rem;
        font-size: 1rem;
        background: var(--accent-color, #00f2fe);
        color: black;
        border: none;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
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
