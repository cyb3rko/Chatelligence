<script lang="ts">
    import { Chart, ChartData, registerables } from "chart.js";
    import { onMount } from "svelte";

    let chartCanvas;
    let ctx;
    let chart;

    export let data: ChartData<
        "bar",
        {
            x: number;
            y: number;
        }[]
    > = { datasets: [] };

    onMount(() => {
        Chart.register(...registerables);

        ctx = chartCanvas.getContext("2d");
        chart = new Chart(ctx, {
            type: "bar",
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
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

<barChart>
    <canvas bind:this={chartCanvas} />
</barChart>

<style>
    main {
    }
</style>
