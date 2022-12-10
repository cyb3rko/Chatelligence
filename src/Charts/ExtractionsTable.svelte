<script lang="ts">
    import {
        Col,
        Container,
        FormGroup,
        Input,
        Label,
        Row,
        Table,
    } from "sveltestrap";
    import ExtractionsTableActions from "../components/ExtractionsTableActions.svelte";
    import { top } from "../utils/array";
    import type { Extraction } from "../utils/processor.types";

    export let title: string = "No title";
    export let extractions: Extraction[] = [];
    let display: Extraction[] = [];

    let ascending = true;
    let page = 1;
    const pageSize = 10;
    let totalExtractions = extractions.length;

    $: {
        display = top(
            extractions,
            pageSize,
            (page - 1) * pageSize,
            "mentions",
            ascending,
        );
    }
</script>

<Container>
    <Row cols={2}>
        <FormGroup>
            <Input type="switch" label="Aufsteigend" bind:checked={ascending} />
        </FormGroup>
        <FormGroup>
            <Row>
                <Col sm={{ size: 1 }} class="align-middle">
                    <Label for="page" style="margin-top: 0.25em;">Page:</Label>
                </Col>
                <Col>
                    <Input
                        type="number"
                        name="page"
                        min={1}
                        max={Math.ceil(extractions.length / 10)}
                        bind:value={page}
                    />
                </Col>
            </Row>
        </FormGroup>
    </Row>
    <Row>
        <Table striped size="sm">
            <thead>
                <th>#</th>
                <th>{title}</th>
                <th>Messages</th>
                <th style="width: 150px;">Actions</th>
            </thead>
            <tbody>
                {#each display as ext, i}
                    <tr>
                        <th scope="row">
                            {ascending
                                ? pageSize * (page - 1) + i + 1
                                : totalExtractions - i - pageSize * (page - 1)}
                        </th>
                        <td>{ext.extracted}</td>
                        <td>{ext.mentions.length}</td>
                        <td>
                            <ExtractionsTableActions extracton={ext} />
                        </td>
                    </tr>
                {/each}
            </tbody>
        </Table>
    </Row>
</Container>
