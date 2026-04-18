<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';

    let messageText = $state('');

    function sendMessage() {
        if (!messageText.trim()) return;
        
        // In galene.js, chat is sent via serverConnection.chat
        if (rtc.connection) {
            rtc.connection.chat('', '', messageText);
        }
        messageText = '';
    }
</script>

<div class="chat-panel glass">
    <div class="chat-header">
        <h3>Chat</h3>
    </div>
    <div class="chat-messages">
        {#each rtc.chat as msg (msg.id)}
            <div class="message">
                <span class="username">{msg.username}:</span>
                <span class="text">{msg.text}</span>
            </div>
        {/each}
    </div>
    <form onsubmit={sendMessage}>
        <input 
            type="text" 
            bind:value={messageText} 
            placeholder="Type a message..." 
        />
        <button type="submit">Send</button>
    </form>
</div>

<style>
    .chat-panel {
        display: flex;
        flex-direction: column;
        width: 300px;
        height: 100%;
        border-left: var(--glass-border);
    }
    .chat-header {
        padding: 0.5rem 1rem;
        border-bottom: var(--glass-border);
    }
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .message {
        font-size: 0.9rem;
    }
    .username {
        font-weight: bold;
        color: var(--accent-color);
        margin-right: 0.5rem;
    }
    form {
        padding: 1rem;
        display: flex;
        gap: 0.5rem;
        border-top: var(--glass-border);
    }
    input {
        flex: 1;
    }
</style>
