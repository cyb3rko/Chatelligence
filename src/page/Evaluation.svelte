<script lang="ts">
    import BarChart from "../Charts/BarChart.svelte";
    import BubbleChart from "../Charts/BubbleChart.svelte";
    import type { ForcedNetworkGraphInput } from "../Charts/ForcedNetworkGraphInput.type";
    import ForceNetworkGraphCanvas from "../Charts/ForceNetworkGraphCanvas.svelte";
    import MessageHoursBarChart from "../Charts/MessageHoursBarChart.svelte";

    export let senderStats;
    export let topMessanger;
    export let emojsCounts;
    export let participantsRelationReduced: ForcedNetworkGraphInput;
</script>

<evaluation>
    <h2>evaluation</h2>

    {#if senderStats && topMessanger}
        <MessageHoursBarChart {senderStats} />

        <BarChart
            data={{
                labels: topMessanger.map((m) => m.sender),
                datasets: [{ data: topMessanger.map((m) => m.messageCount) }],
            }}
        />

        <h2>Emojis</h2>
        <div style="width: calc(100% - 16px);">
            <BubbleChart data={emojsCounts} />
        </div>

        <div style="height: 50vh; background-color: aliceblue;">
            <ForceNetworkGraphCanvas graph={participantsRelationReduced} />
        </div>
    {/if}
</evaluation>

<style>
    evaluation {
    }
</style>
