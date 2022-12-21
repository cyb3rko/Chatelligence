<script lang="ts">
    import { Button, Card, Row } from "sveltestrap";
    import BarChart from "../Charts/BarChart.svelte";
    import BubbleChart from "../Charts/BubbleChart.svelte";
    import ExtractionsTable from "../Charts/ExtractionsTable.svelte";
    import type { ForcedNetworkGraphInput } from "../Charts/ForcedNetworkGraphInput.type";
    import ForceNetworkGraphCanvas from "../Charts/ForceNetworkGraphCanvas.svelte";
    import MessageHoursBarChart from "../Charts/MessageHoursBarChart.svelte";
    import Peoplelist from "../components/Peoplelist.svelte";
    import type { Analysis, SenderStats } from "../webWorker/processor.worker";

    export let analysis: Analysis;
    export let aggregatedSenderStats;
    export let topMessanger: SenderStats;
    export let emojsCounts;
    export let participantsRelationReduced: ForcedNetworkGraphInput;

    let showPeopleList = false;
</script>

<evaluation>
    {#if aggregatedSenderStats && topMessanger}
        <h2>Nachrichten je Uhrzeit</h2>
        <MessageHoursBarChart senderStats={aggregatedSenderStats} />

        <br /><br />
        <h2>Teilnehmer mit den meisten Nachrichten</h2>
        <BarChart
            data={{
                labels: topMessanger.map((m) => m.sender),
                datasets: [
                    {
                        data: topMessanger.map((m) => m.messageCount),
                        backgroundColor: topMessanger.map((m) => m.color),
                    },
                ],
            }}
            showLegend={false}
        />

        <br /><br />
        <Row>
            <h2>Teilnehmerliste</h2>
            <Button
                on:click={() => {
                    showPeopleList = !showPeopleList;
                }}>{showPeopleList ? "Hide" : "Show"}</Button
            >
        </Row>
        <br />
        <Peoplelist
            isOpen={showPeopleList}
            peoples={Array.from(analysis.sender.values()).sort()}
        />

        <br /><br />
        <h2>Emojis</h2>
        <ExtractionsTable extractions={analysis.emojis} title="Emoji" />

        <br /><br />
        <h2>Words</h2>
        <ExtractionsTable extractions={analysis.words} title="Word" />

        <br /><br />
        <h2>Emojis</h2>
        <div style="width: calc(100% - 16px);">
            <BubbleChart data={emojsCounts} />
        </div>

        <Card style="height: 50vh; background-color: #262627;">
            <ForceNetworkGraphCanvas graph={participantsRelationReduced} />
        </Card>
    {/if}
</evaluation>

<style>
    evaluation {
    }
</style>
