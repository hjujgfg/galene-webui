<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';

    let username = $state('');
    let password = $state('');
    let group = $state('public');
    let endpoint = $state(''); // Usually we get this from fetch(url + ".status")

    let loading = $state(false);

    async function handleLogin() {
        loading = true;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const defaultEndpoint = `${protocol}//${window.location.host}/ws`;
        const finalUsername = username || `user_${Math.floor(Math.random() * 1000)}`;

        try {
            await rtc.connect(endpoint || defaultEndpoint);
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
        <h2>Join Galène</h2>
        <div class="field">
            <label for="endpoint">Server URL</label>
            <input id="endpoint" bind:value={endpoint} placeholder="ws://localhost:8443/ws" disabled={loading} />
        </div>
        <div class="field">
            <label for="group">Group</label>
            <input id="group" bind:value={group} disabled={loading} />
        </div>
        <div class="field">
            <label for="username">Username</label>
            <input id="username" bind:value={username} disabled={loading} />
        </div>
        <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" bind:value={password} disabled={loading} />
        </div>
        <button type="submit" disabled={loading}>
            {loading ? 'Connecting...' : 'Connect'}
        </button>
    </form>
</div>

<style>
    .login-container {
        padding: 2rem;
        max-width: 400px;
        margin: 100px auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    h2 {
        margin-top: 0;
        text-align: center;
        color: var(--accent-color);
    }
</style>
