<script lang="ts">
    import { Alert, Col, ListGroup, ListGroupItem } from "sveltestrap";
    import type { Extraction } from "../utils/processor.types";

    export let extractions: Extraction[];
    export let title: string;
</script>

<Col>
    {#if extractions.length > 0}
        <ListGroup>
            <ListGroupItem color="info">{title}</ListGroupItem>
            {#each extractions as ex}
                <ListGroupItem>{ex.extracted}</ListGroupItem>
            {/each}
        </ListGroup>
    {:else}
        <Alert color="info">Keine {title} gefunden</Alert>
    {/if}
</Col>
