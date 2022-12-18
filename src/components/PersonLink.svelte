<script lang="ts">
    import { Link } from "svelte-routing";

    export let id: String;
    export let disabled = false;
</script>

<Link to="/app/person/{id}" {disabled}>{id}</Link>
