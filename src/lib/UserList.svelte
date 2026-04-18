<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';

    const users = $derived(Object.entries(rtc.users).map(([id, user]) => ({
        id,
        ...user
    })));

    function hasPermission(user: any, perm: string) {
        return user.permissions && user.permissions.includes(perm);
    }
</script>

<div class="user-list glass">
    <div class="header">
        <h3>Users ({users.length})</h3>
    </div>
    <div class="users">
        {#each users as user (user.id)}
            <div class="user-item">
                <span class="status-dot" class:online={true}></span>
                <span class="username">{user.username || user.id}</span>
                <div class="badges">
                    {#if hasPermission(user, 'op')}
                        <span class="badge op" title="Operator">OP</span>
                    {/if}
                    {#if hasPermission(user, 'present')}
                        <span class="badge present" title="Presenter">P</span>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .user-list {
        width: 240px;
        height: 100%;
        border-right: var(--glass-border);
        display: flex;
        flex-direction: column;
    }
    .header {
        padding: 0.5rem 1rem;
        border-bottom: var(--glass-border);
    }
    .users {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .user-item {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        border-radius: 4px;
        gap: 0.75rem;
        transition: background 0.2s;
    }
    .user-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #666;
    }
    .status-dot.online {
        background: #4caf50;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
    }
    .username {
        flex: 1;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .badges {
        display: flex;
        gap: 0.25rem;
    }
    .badge {
        font-size: 0.6rem;
        padding: 1px 4px;
        border-radius: 3px;
        font-weight: bold;
    }
    .badge.op {
        background: rgba(255, 215, 0, 0.2);
        color: gold;
        border: 1px solid rgba(255, 215, 0, 0.4);
    }
    .badge.present {
        background: rgba(0, 229, 255, 0.2);
        color: var(--accent-color);
        border: 1px solid rgba(0, 229, 255, 0.4);
    }
</style>
