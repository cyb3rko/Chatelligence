<script lang="ts">
    import {
        Card,
        CardBody,
        CardHeader,
        CardTitle,
        Col,
        Row,
        Table,
    } from "sveltestrap";
    import MessageHoursBarChart from "../Charts/MessageHoursBarChart.svelte";
    import PiChart from "../Charts/PiChart.svelte";
    import { generateUiColorFromString } from "../utils/color";
    import { round, toPercent } from "../utils/math";
    import type { Analysis } from "../webWorker/processor.worker";

    export let id: string;
    export let analysis: Analysis;

    let senderLanguages = analysis?.senderLanguages?.[id]
        ? Object.entries(analysis.senderLanguages[id])
              .filter((l) => {
                  return l[1] > 0.005;
              })
              .sort((a, b) => {
                  return b[1] - a[1];
              })
        : [];

    let senderStats = analysis?.senderStats?.find((a) => a.sender == id);
    console.log(senderStats);
</script>

<person>
    <h2>{id}</h2>

    <Card>
        <CardHeader>
            <CardTitle>Informationen</CardTitle>
        </CardHeader>
        <CardBody>
            {#if senderStats}
                <Table>
                    <tbody>
                        <tr>
                            <th scope="row">Nachrichtenanzahl</th>
                            <td>{senderStats.messageCount}</td>
                        </tr>
                        <tr>
                            <th scope="row">Wörter</th>
                            <td>{senderStats.wordCount}</td>
                        </tr>
                        <tr>
                            <th scope="row">Wörter pro Nachricht</th>
                            <td>{round(senderStats.wordsPerMessage, 2)}</td>
                        </tr>
                    </tbody>
                </Table>
            {/if}
        </CardBody>
    </Card>

    <br />

    <Card>
        <CardHeader>
            <CardTitle>Sprachen</CardTitle>
        </CardHeader>
        <CardBody>
            <Row cols={{ lg: 2, md: 1 }}>
                <Col>
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
                </Col>

                <Col>
                    <Table>
                        <thead>
                            <tr>
                                <th>Sprache</th>
                                <th>Erkennungsrate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each senderLanguages as lang}
                                <tr>
                                    <td>{lang[0]}</td>
                                    <td>{toPercent(lang[1], 0)}%</td>
                                </tr>
                            {/each}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </CardBody>
    </Card>

    <br />

    <Card>
        <CardHeader>
            <CardTitle>Nachrichten je Uhrzeit</CardTitle>
        </CardHeader>
        <CardBody>
            {#if senderStats}
                <MessageHoursBarChart senderStats={[senderStats]} />
            {/if}
        </CardBody>
    </Card>
</person>
