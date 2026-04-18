<script lang="ts">
    import { rtc } from '$lib/rtc.svelte';
    import PeerTile from './PeerTile.svelte';
</script>

<div class="video-grid">
    {#each rtc.remoteTracks as track (track.id)}
        <PeerTile {track} />
    {/each}
</div>

<style>
    .video-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1rem;
        padding: 1rem;
        height: 100%;
        overflow-y: auto;
    }
</style>
