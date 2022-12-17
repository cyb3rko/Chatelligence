<script lang="ts">
    import { Chart, ChartData, registerables } from "chart.js";
    import { onMount } from "svelte";

    let chartCanvas;
    let ctx;
    let chart;

    export let data: ChartData<"doughnut">;

    onMount(() => {
        Chart.register(...registerables);

        ctx = chartCanvas.getContext("2d");
        chart = new Chart(ctx, {
            type: "doughnut",
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    });

    $: {
        if (chart && data.datasets.length > 0) {
            chart.data = data;
            chart.update();
            console.log("Updated chart", data);
        }
    }
</script>

<piChart>
    <canvas bind:this={chartCanvas} />
</piChart>
