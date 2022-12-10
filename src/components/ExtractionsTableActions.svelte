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
    import { aggregate, count } from "../utils/array";
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
</script>

<Container>
    <Col style="position: relative;" rows={2}>
        <Row>
            <Col xs="auto">
                <Button color="info" disabled>
                    <Icon name="pie-chart-fill" />
                </Button>
            </Col>
            <Col xs="auto">
                <Button color="secondary" on:click={toggleMentionsList}
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
</Container>
