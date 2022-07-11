<script lang="ts">
    import BarChart from "../Charts/BarChart.svelte";
    import MessageHoursBarChart from "../Charts/MessageHoursBarChart.svelte";

    export let senderStats;
    export let topMessanger;
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
    {/if}
</evaluation>

<style>
    evaluation {
    }
</style>
