<script lang="ts">
    import type { Analysis } from "../webWorker/processor.worker";

    export let id: string;
    export let analysis: Analysis;
</script>

<person>
    <h2>{id}</h2>

    {#each Object.entries(analysis.senderLanguages[id]) as lang}
        {lang[0]}: {lang[1]}
        <br />
    {/each}
</person>
