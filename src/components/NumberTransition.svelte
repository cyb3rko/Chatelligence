<script lang="ts">
    export let value = 0;
    export let time = 1000;
    export let steps = 10;
    export let numberFormatter: (n: number) => string = (n) => n.toFixed(0);

    let lastValue = { v: 0 };
    let displayValue = 0;

    let internal;

    $: {
        value;
        clearInterval(internal);
        internal = setInterval(step, time / steps);
    }

    const step = () => {
        if (
            Math.abs(displayValue - value) <
            Math.abs((value - lastValue.v) / steps)
        ) {
            lastValue.v = value;
            displayValue = value;
            clearInterval(internal);
            return;
        }

        displayValue = displayValue + (value - lastValue.v) / steps;
    };
</script>

<number>{numberFormatter(displayValue)}</number>
