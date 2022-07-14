<script lang="ts">
    import BarChart from "./BarChart.svelte";

    export let senderStats;

    let exampleData = {
        labels: [
            "0 - 0:59",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23 - 23:59",
        ],
        datasets: [],
    };

    $: {
        if (senderStats) {
            let x = exampleData;

            x.datasets = [];

            x.datasets.push(
                ...senderStats.map((s) => {
                    return {
                        label: s.sender,
                        data: s.messageHours.map((v) => {
                            return v;
                        }),
                        backgroundColor:
                            "#" +
                            Math.floor(Math.random() * 16777215).toString(16),
                    };
                }),
            );
            console.log(x);
            exampleData = x;
        }
    }
</script>

<BarChart data={exampleData} />
