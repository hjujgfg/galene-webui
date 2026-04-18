<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';

    let username = $state('');
    let password = $state('');
    let group = $state('public');
    let endpoint = $state(''); // Usually we get this from fetch(url + ".status")

    let loading = $state(false);

    async function handleLogin() {
        loading = true;
        const finalUsername = username || `user_${Math.floor(Math.random() * 1000)}`;

        try {
            await rtc.connect(rtc.endpoint);
            await rtc.join(group, finalUsername, { type: 'password', password });
        } catch (e: any) {
            console.error('Login failed:', e);
            rtc.error = e.message || e.toString();
        } finally {
            loading = false;
        }
    }
</script>

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

<style>
    .login-container {
        padding: 2.5rem;
        width: 100%;
        max-width: 380px;
        margin: 10vh auto;
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
</style>
