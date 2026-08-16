<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';
    import PeerTile from './PeerTile.svelte';
    import LocalScreenTile from './LocalScreenTile.svelte';

    let remoteScreenTrack = $derived(
        rtc.remoteTracks.find(t => 
            t.stream?.label === 'screenshare' || 
            t.stream?.label === 'screen' || 
            t.label?.includes('(Screen)')
        )
    );

    let cameraTracks = $derived(
        rtc.remoteTracks.filter(t => t !== remoteScreenTrack)
    );

    let hasScreenShare = $derived(!!rtc.screenUpStream || !!remoteScreenTrack);
</script>

<div class="video-container" class:has-presentation={hasScreenShare}>
    {#if hasScreenShare}
        <div class="presentation-stage">
            {#if rtc.screenUpStream}
                <LocalScreenTile />
            {:else if remoteScreenTrack}
                <PeerTile track={remoteScreenTrack} />
            {/if}
        </div>

        {#if cameraTracks.length > 0}
            <div class="camera-strip">
                {#each cameraTracks as track (track.id)}
                    <div class="strip-item">
                        <PeerTile {track} />
                    </div>
                {/each}
            </div>
        {/if}
    {:else}
        <div class="video-grid">
            {#each rtc.remoteTracks as track (track.id)}
                <PeerTile {track} />
            {/each}
        </div>
    {/if}
</div>

<style>
    .video-container {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .video-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1rem;
        height: 100%;
        width: 100%;
        overflow-y: auto;
    }

    .presentation-stage {
        flex: 1;
        width: 100%;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.75rem;
    }

    .camera-strip {
        display: flex;
        gap: 0.75rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
        max-height: 140px;
    }

    .strip-item {
        width: 200px;
        flex-shrink: 0;
        aspect-ratio: 16/9;
    }
</style>
