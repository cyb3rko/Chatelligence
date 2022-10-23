<script lang="ts">
    import AscDescSwitch from "../components/AscDescSwitch.svelte";
    import { top } from "../utils/array";
    import type { Extraction } from "../utils/processor.types";

    export let title: string = "No title";
    export let extractions: Extraction[] = [];
    let display: Extraction[] = [];

    let ascending = true;
    let page = 1;

    $: {
        display = top(extractions, 10, (page - 1) * 10, "mentions", ascending);
    }
</script>

<container>
    <table>
        <tr><th>{title}</th><th>Mentions</th><th>See all</th></tr>
        {#each display as ext}
            <tr>
                <td>{ext.extracted}</td>
                <td>{ext.mentions.length}</td>
                <td>//TODO: Implement mentions view</td>
            </tr>
        {/each}
    </table>
    <settings>
        <AscDescSwitch bind:asc={ascending} />
        <label for="page">Page</label>
        <input
            type="number"
            name="page"
            min={1}
            max={Math.ceil(extractions.length / 10)}
            bind:value={page}
        />
    </settings>
</container>
