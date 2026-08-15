<script lang="ts">
    import { goto } from '$app/navigation';

    let codeOrUrl = $state('');
    let error = $state('');

    function generateRoomId(): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        const segment = (len: number) => 
            Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `public/${segment(3)}-${segment(4)}-${segment(3)}`;
    }

    function createNewMeeting() {
        const roomId = generateRoomId();
        goto(`/${roomId}`);
    }

    function joinMeeting(e: Event) {
        e.preventDefault();
        if (!codeOrUrl.trim()) return;

        let input = codeOrUrl.trim();
        // Handle full URL input like https://meet.hjujgfg.scot/abc-defg-hij or /abc-defg-hij
        try {
            if (input.startsWith('http://') || input.startsWith('https://')) {
                const url = new URL(input);
                input = url.pathname.replace(/^\//, '');
            } else if (input.startsWith('/')) {
                input = input.replace(/^\//, '');
            }
        } catch {
            // keep input as is
        }

        // Remove any leftover slashes or parameters
        input = input.split('?')[0].split('#')[0].replace(/\/$/, '');

        if (!input) {
            error = 'Please enter a valid room code or link';
            return;
        }

        goto(`/${input}`);
    }
</script>

<svelte:head>
    <title>Galène WebUI - Video calls for everyone</title>
</svelte:head>

<div class="landing-container">
    <header class="landing-header glass">
        <div class="brand">
            <img src="/src/lib/assets/favicon.svg" alt="Galene Logo" class="logo" />
            <span class="brand-name">Galène WebUI</span>
        </div>
    </header>

    <main class="hero-section">
        <div class="hero-content">
            <h1>Premium video meetings.<br /><span class="highlight">Free & open for everyone.</span></h1>
            <p class="subtitle">
                High quality WebRTC video conferencing powered by Galène SFU. Lightweight, fast, and secure.
            </p>

            <div class="action-box">
                <button type="button" class="btn-primary new-meeting-btn" onclick={createNewMeeting}>
                    <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    New meeting
                </button>

                <form onsubmit={joinMeeting} class="join-form">
                    <div class="input-wrapper glass">
                        <svg viewBox="0 0 24 24" class="icon input-icon"><path fill="currentColor" d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 7h-2v-2h2v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>
                        <input 
                            type="text" 
                            bind:value={codeOrUrl} 
                            placeholder="Enter a code or link"
                        />
                    </div>
                    <button type="submit" class="btn-secondary" disabled={!codeOrUrl.trim()}>
                        Join
                    </button>
                </form>
            </div>

            {#if error}
                <p class="error-msg">{error}</p>
            {/if}
        </div>

        <div class="hero-card glass">
            <div class="card-preview">
                <div class="fake-video-grid">
                    <div class="tile t1">
                        <div class="user-badge">Alice</div>
                    </div>
                    <div class="tile t2">
                        <div class="user-badge">Bob</div>
                    </div>
                </div>
            </div>
            <div class="card-info">
                <h3>Get a link you can share</h3>
                <p>Click <strong>New meeting</strong> to get a link you can send to people you want to meet with.</p>
            </div>
        </div>
    </main>
</div>

<style>
    .landing-container {
        min-height: 100vh;
        width: 100vw;
        background: radial-gradient(circle at 50% 20%, #151520 0%, #0a0a0c 100%);
        color: #fff;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }

    .landing-header {
        padding: 1.25rem 2.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .logo {
        width: 32px;
        height: 32px;
    }

    .brand-name {
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--accent-color, #00f2fe);
    }

    .hero-section {
        flex: 1;
        max-width: 1200px;
        margin: 0 auto;
        padding: 4rem 2rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: center;
        box-sizing: border-box;
    }

    h1 {
        font-size: 3rem;
        line-height: 1.15;
        font-weight: 700;
        letter-spacing: -0.03em;
        margin: 0 0 1.5rem 0;
    }

    .highlight {
        color: var(--accent-color, #00f2fe);
    }

    .subtitle {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
        margin-bottom: 2.5rem;
        max-width: 500px;
    }

    .action-box {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.85rem 1.6rem;
        background: var(--accent-color, #00f2fe);
        color: #000;
        font-weight: 700;
        font-size: 1rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.2s ease, filter 0.2s ease;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        filter: brightness(1.1);
    }

    .join-form {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .input-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .input-wrapper input {
        background: transparent;
        border: none;
        outline: none;
        color: #fff;
        font-size: 1rem;
        width: 200px;
    }

    .icon {
        width: 20px;
        height: 20px;
    }

    .input-icon {
        opacity: 0.5;
    }

    .btn-secondary {
        padding: 0.85rem 1.4rem;
        background: transparent;
        color: var(--accent-color, #00f2fe);
        font-weight: 600;
        font-size: 1rem;
        border: 1px solid rgba(0, 242, 254, 0.4);
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .btn-secondary:hover:not(:disabled) {
        background: rgba(0, 242, 254, 0.1);
    }

    .btn-secondary:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        border-color: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.4);
    }

    .error-msg {
        color: #ff5252;
        margin-top: 1rem;
        font-size: 0.9rem;
    }

    .hero-card {
        padding: 2rem;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .card-preview {
        aspect-ratio: 16/10;
        border-radius: 12px;
        overflow: hidden;
        background: #0f0f14;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .fake-video-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 8px;
        height: 100%;
        box-sizing: border-box;
    }

    .tile {
        background: #1e1e28;
        border-radius: 8px;
        position: relative;
        display: flex;
        align-items: flex-end;
        padding: 8px;
    }

    .t1 { background: linear-gradient(135deg, #1e293b, #0f172a); }
    .t2 { background: linear-gradient(135deg, #312e81, #1e1b4b); }

    .user-badge {
        font-size: 0.75rem;
        background: rgba(0, 0, 0, 0.6);
        padding: 4px 8px;
        border-radius: 4px;
        backdrop-filter: blur(4px);
    }

    .card-info {
        text-align: center;
    }

    .card-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .card-info p {
        margin: 0;
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.95rem;
        line-height: 1.5;
    }

    @media (max-width: 900px) {
        .hero-section {
            grid-template-columns: 1fr;
            padding: 2rem 1rem;
            gap: 2.5rem;
        }

        h1 {
            font-size: 2.25rem;
        }

        .action-box {
            flex-direction: column;
            align-items: stretch;
        }

        .join-form {
            flex-direction: column;
            align-items: stretch;
        }

        .input-wrapper input {
            width: 100%;
        }
    }
</style>
