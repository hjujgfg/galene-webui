<script lang="ts">
    import { fly } from 'svelte/transition';
    import { rtc } from '$lib/rtc.svelte';
</script>

{#if rtc.settingsOpen}
    <div 
        transition:fly={{ x: 320, duration: 300 }}
        class="settings-sidebar glass"
    >
        <div class="header">
            <h2>Settings</h2>
            <button class="close-btn" onclick={() => rtc.settingsOpen = false}>&times;</button>
        </div>
        
        <div class="content">
            <section>
                <h3>Media Options</h3>
                <label>
                    <input type="checkbox" bind:checked={rtc.settings.mirrorView} />
                    Mirror View
                </label>
                <label>
                    <input type="checkbox" bind:checked={rtc.settings.blackboardMode} />
                    Blackboard Mode
                </label>
                <label>
                    <input type="checkbox" bind:checked={rtc.settings.preprocessing} />
                    Noise Suppression
                </label>
                <label>
                    <input type="checkbox" bind:checked={rtc.settings.hqaudio} />
                    High-quality Audio
                </label>
            </section>

            <section>
                <h3>Stream Settings</h3>
                <div class="field">
                    <label for="simulcast">Simulcast</label>
                    <select id="simulcast" bind:value={rtc.settings.simulcast}>
                        <option value="off">Off</option>
                        <option value="auto">Auto</option>
                        <option value="on">On</option>
                    </select>
                </div>
                <div class="field">
                    <label for="send">Send Resolution</label>
                    <select id="send" bind:value={rtc.settings.send}>
                        <option value="lowest">Lowest</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="unlimited">Unlimited</option>
                    </select>
                </div>
                <div class="field">
                    <label for="request">Receive Quality</label>
                    <select id="request" bind:value={rtc.settings.request}>
                        <option value="">Nothing</option>
                        <option value="audio">Audio Only</option>
                        <option value="screenshare">Screenshare Only</option>
                        <option value="everything-low">Low Quality</option>
                        <option value="everything">Everything</option>
                    </select>
                </div>
            </section>

            <section>
                <h3>Other</h3>
                <label>
                    <input type="checkbox" bind:checked={rtc.settings.activityDetection} />
                    Activity Detection
                </label>
                <label>
                    <input type="checkbox" bind:checked={rtc.settings.displayAll} />
                    Display audio-only users
                </label>
            </section>
        </div>
    </div>
{/if}

<style>
    .settings-sidebar {
        position: fixed;
        right: 0;
        top: 0;
        bottom: 0;
        width: 320px;
        z-index: 200;
        display: flex;
        flex-direction: column;
        border-left: var(--glass-border);
    }

    .header {
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: var(--glass-border);
    }

    .close-btn {
        background: transparent;
        border: none;
        font-size: 1.5rem;
        color: white;
        cursor: pointer;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--accent-color);
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
        cursor: pointer;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .field label {
        font-size: 0.8rem;
        opacity: 0.7;
    }

    select {
        width: 100%;
        background: rgba(0, 0, 0, 0.3);
    }
</style>
