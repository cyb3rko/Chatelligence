<script lang="ts">
    import { NAME_OTHER } from "../utils/array";
    import BarChart from "./BarChart.svelte";

    export let senderStats;

    let displayData = {
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
            let x = displayData;

            x.datasets = [];

            x.datasets.push(
                ...senderStats.map((s) => {
                    return {
                        label: s.sender,
                        hidden: s.sender == NAME_OTHER,
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
            displayData = x;
        }
    }
</script>

<BarChart data={displayData} />
