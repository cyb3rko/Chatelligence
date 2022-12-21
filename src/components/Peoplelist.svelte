<script lang="ts">
    import { Collapse, ListGroup, ListGroupItem } from "sveltestrap";
    import PersonLink from "./PersonLink.svelte";

    export let peoples: string[] = [];
    export let isOpen = false;
</script>

<Collapse {isOpen}>
    <ListGroup>
        {#each peoples as p}
            <ListGroupItem><PersonLink id={p} /></ListGroupItem>
        {/each}
    </ListGroup>
</Collapse>
