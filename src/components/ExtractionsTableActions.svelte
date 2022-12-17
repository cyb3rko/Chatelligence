<script lang="ts">
    import {
        Button,
        Col,
        Container,
        Icon,
        Modal,
        Row,
        Table,
    } from "sveltestrap";
    import PiChart from "../Charts/PiChart.svelte";
    import { aggregate, count } from "../utils/array";
    import { generateColorFromString } from "../utils/color";
    import type { Extraction } from "../utils/processor.types";

    let isOpenMentionsList = false;
    const toggleMentionsList = () => {
        isOpenMentionsList = !isOpenMentionsList;
    };

    export let extracton: Extraction;
    let topMentions = aggregate(
        count(extracton.mentions, "sender").toObject(),
        5,
        "count",
        "key",
        true,
    );

    $: {
        topMentions = aggregate(
            count(extracton.mentions, "sender").toObject(),
            5,
            "count",
            "key",
            true,
        );
    }

    let isOpenExtractions = false;
    const toggleExtractions = () => {
        isOpenExtractions = !isOpenExtractions;
    };
</script>

<Container>
    <Col style="position: relative;" rows={2}>
        <Row>
            <Col xs="auto">
                <Button color="info" on:click={toggleMentionsList}>
                    <Icon name="pie-chart-fill" />
                </Button>
            </Col>
            <Col xs="auto">
                <Button color="secondary" on:click={toggleExtractions}
                    >List</Button
                >
            </Col>
        </Row>
    </Col>
    <Modal
        body
        header={`Information about '${extracton.extracted}'`}
        isOpen={isOpenMentionsList}
        toggle={toggleMentionsList}
    >
        It appears in {extracton.mentions.length} messages.
        <br />
        <br />
        <PiChart
            data={{
                labels: topMentions.map((r) => {
                    return r.key;
                }),
                datasets: [
                    {
                        label: `'${extracton.extracted}' by sender`,
                        data: topMentions.map((r) => {
                            return r.count;
                        }),
                        backgroundColor: topMentions.map((r) => {
                            return generateColorFromString(r.key);
                        }),
                        hoverOffset: 4,
                    },
                ],
            }}
        />
        <br />
        <br />
        <Table striped size="sm">
            <thead>
                <th>#</th>
                <th>Sender</th>
                <th>Count</th>
            </thead>
            <tbody>
                {#each topMentions as m, i}
                    <tr>
                        <th scope="row">{i + 1}</th>
                        <td>{m.key}</td>
                        <td>{m.count}</td>
                    </tr>
                {/each}
            </tbody>
        </Table>
    </Modal>
    <Modal
        body
        header={`All Mentions of '${extracton.extracted}'`}
        isOpen={isOpenExtractions}
        toggle={toggleExtractions}
        size="xl"
    >
        <Table striped responsive>
            <thead>
                <th>#</th>
                <th>Sender</th>
                <th style="width:50%">Message</th>
                <th width="50%">Time</th>
            </thead>
            <tbody>
                {#each extracton.mentions as m, i}
                    <tr>
                        <th scope="row">{i + 1}</th>
                        <td>{m.sender}</td>
                        <td>{m.message}</td>
                        <td>{m.time}</td>
                    </tr>
                {/each}
            </tbody>
        </Table>
    </Modal>
</Container>
