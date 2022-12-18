<script lang="ts">
    import PiChart from "../Charts/PiChart.svelte";
    import { generateUiColorFromString } from "../utils/color";
    import type { Analysis } from "../webWorker/processor.worker";

    export let id: string;
    export let analysis: Analysis;

    let senderLanguages = analysis?.senderLanguages?.[id]
        ? Object.entries(analysis.senderLanguages[id])
        : [];
</script>

<person>
    <h2>{id}</h2>

    <PiChart
        data={{
            labels: senderLanguages.map((l) => l[0]),
            datasets: [
                {
                    data: senderLanguages.map((l) => l[1]),
                    backgroundColor: senderLanguages.map((l) =>
                        generateUiColorFromString(l[0]),
                    ),
                },
            ],
        }}
    />

    {#each senderLanguages as lang}
        {lang[0]}: {lang[1]}
        <br />
    {/each}
</person>
