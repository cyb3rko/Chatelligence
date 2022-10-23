<script lang="ts">
    export let asc: Boolean = false;
</script>

<test on:click={() => (asc = !asc)}>
    <div class:desc={!asc}>⬆</div>
</test>

<style>
    test {
        display: inline-block;
        box-sizing: border-box;
        position: relative;

        width: 32px;
        height: 32px;
        background-color: antiquewhite;
    }

    test div {
        display: inline-block;
        user-select: none;
        position: absolute;
        left: 50%;
        top: 50%;
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform-origin: center center;
        transform: translate(-50%, -50%) rotate(0deg);
    }
    .desc {
        transform: translate(-50%, -50%) rotate(180deg);
    }
</style>
