<script lang="ts">
    // Taken from:
    // https://svelte.dev/repl/c23b43904005457981e78ca5042f7dd4?version=3.29.7
    // TODO: figure out Authors and License

    import { onMount } from "svelte";
    import { scaleLinear, scaleOrdinal } from "d3-scale";
    import { zoom, zoomIdentity } from "d3-zoom";
    import { schemeCategory10 } from "d3-scale-chromatic";
    import { select, selectAll, pointer } from "d3-selection";
    import { drag } from "d3-drag";
    import {
        forceSimulation,
        forceLink,
        forceManyBody,
        forceCenter,
        forceCollide,
    } from "d3-force";

    let activeNodeLinks: Link = [];

    $: {
        if (activeNode) {
            activeNodeLinks = graph.links
                .filter((link) => link.source === activeNode.id)
                .sort((a, b) => a.value - b.value);
            simulationUpdate();
        }
    }

    //import { event as currentEvent } from "d3-selection"; // Needed to get drag working, see: https://github.com/d3/d3/issues/2733
    let d3 = {
        zoom,
        zoomIdentity,
        scaleLinear,
        scaleOrdinal,
        schemeCategory10,
        select,
        selectAll,
        pointer,
        drag,
        forceSimulation,
        forceLink,
        forceManyBody,
        forceCenter,
        forceCollide,
    };

    function lerpColor(a: number, b: number, amount) {
        var ar = a >> 16,
            ag = (a >> 8) & 0xff,
            ab = a & 0xff,
            br = b >> 16,
            bg = (b >> 8) & 0xff,
            bb = b & 0xff,
            rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);

        return (
            "#" +
            (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0)
                .toString(16)
                .slice(1)
        );
    }

    type Link = {
        source: string;
        target: string;
        value: number;
        _value: number;
    }[];

    export let graph: {
        nodes: { id: string; group: number }[];
        links: Link;
    };

    let maxLink_Value = graph.links.reduce(
        (acc, link) => Math.max(acc, link._value),
        0,
    );

    export let textColor = "#fafafa";

    let canvas: HTMLCanvasElement;
    let width = 500;
    let height = 600;
    let max = 100;
    const nodeRadius = 5;
    let activeNode: any = false;
    const padding = { top: 20, right: 40, bottom: 40, left: 25 };

    $: xScale = scaleLinear()
        .domain([0, 20])
        .range([padding.left, width - padding.right]);

    $: yScale = scaleLinear()
        .domain([0, 12])
        .range([height - padding.bottom, padding.top]);

    $: xTicks = width > 180 ? [0, 4, 8, 12, 16, 20] : [0, 10, 20];

    $: yTicks = height > 180 ? [0, 2, 4, 6, 8, 10, 12] : [0, 4, 8, 12];

    $: d3yScale = scaleLinear().domain([0, height]).range([height, 0]);

    $: links = graph.links.map((d) => Object.create(d));
    $: nodes = graph.nodes.map((d) => {
        (d as any).size = Math.pow(
            graph.links
                .filter((link) => link.source == d.id || link.target == d.id)
                .map((link) => link.value)
                .reduce((a, b) => a + b, 0),
            2,
        );
        if (d.id == "You") {
            max = (d as any).size;
            (d as any).details.messages = max;
        }
        return Object.create(d);
    });

    function nodeColor(context, d) {
        let nodesize = 2 + Math.sqrt(d.size) / 5;
        let radgrad = context.createRadialGradient(
            d.x,
            d.y,
            nodesize / 3,
            d.x,
            d.y,
            nodesize,
        );
        radgrad.addColorStop(0, d.color + "BB");
        radgrad.addColorStop(0.9, d.color + "BB");
        radgrad.addColorStop(1, d.color + "00");

        return radgrad;
    }
    let showCard;
    let transform = d3.zoomIdentity;
    let simulation, context: CanvasRenderingContext2D;
    let dpi = 1;
    onMount(() => {
        dpi = window.devicePixelRatio || 1;
        context = canvas.getContext("2d");
        resize();

        simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d) => (d as any).id)
                    .distance(
                        (d) =>
                            2 +
                            Math.sqrt(max) / 4 +
                            130 * Math.pow(2, -(d as any).value / 1000),
                    ),
            )
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            //.force('collision', d3.forceCollide().radius((d) => Math.sqrt(d.size)/4))
            .on("tick", simulationUpdate);

        // title
        d3.select(context.canvas).on("mousemove", (event) => {
            const d = simulation.find(
                transform.invertX(event.offsetX * dpi),
                transform.invertY(event.offsetY * dpi),
                50,
            );

            if (d) activeNode = d;
            else activeNode = false;
        });

        d3.select(context.canvas).on("click", () => {
            if (activeNode) {
                showCard = JSON.parse(
                    JSON.stringify({
                        id: (activeNode as any).id,
                        details: (activeNode as any).details,
                    }),
                );
            }
        });

        d3.select(canvas)
            .call(
                d3
                    .drag()
                    .container(canvas)
                    .subject(dragsubject)
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended),
            )
            .call(
                d3
                    .zoom()
                    .scaleExtent([1 / 10, 8])
                    .on("zoom", zoomed),
            );
    });

    function simulationUpdate() {
        context.save();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);

        let alpha = 0;
        links.forEach((d) => {
            // TODO: color based on link value
            context.beginPath();
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);

            alpha = graph.links[d.index]?._value / maxLink_Value ?? 0.1;
            context.globalAlpha = alpha;

            let linkBelongsToActiveNode =
                graph.nodes[activeNode.index]?.id ==
                    graph.links[d.index]?.target ||
                graph.nodes[activeNode.index]?.id ==
                    graph.links[d.index]?.source;

            context.strokeStyle = lerpColor(
                0x999999,
                linkBelongsToActiveNode ? 0xffcc33 : 0x33ccff,
                linkBelongsToActiveNode ? 1 : alpha,
            );
            context.lineWidth = Math.cbrt(d.value) / 2;
            context.stroke();
            context.globalAlpha = 1;
        });

        nodes.forEach((d, i) => {
            context.beginPath();
            context.arc(d.x, d.y, 2 + Math.sqrt(d.size) / 5, 0, 2 * Math.PI);
            context.strokeStyle = "transparent";
            context.lineWidth = 1.5;
            context.stroke();
            context.fillStyle = nodeColor(context, d);
            context.fill();
            if (d.size > max / 50) {
                context.fillStyle = textColor;
                d.id
                    .split(/(?=[A-Z])/)
                    .forEach((word, index) =>
                        context.fillText(word, d.x - 10, d.y + 10 * index),
                    );
            }
        });
        context.restore();
    }

    function zoomed(currentEvent) {
        transform = currentEvent.transform;
        simulationUpdate();
    }

    // Use the d3-force simulation to locate the node
    function dragsubject(currentEvent) {
        const node = simulation.find(
            transform.invertX(currentEvent.x * dpi),
            transform.invertY(currentEvent.y * dpi),
            50,
        );
        if (node) {
            node.x = transform.applyX(node.x);
            node.y = transform.applyY(node.y);
        }
        return node;
    }

    function dragstarted(currentEvent) {
        if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
        currentEvent.subject.fx = transform.invertX(currentEvent.subject.x);
        currentEvent.subject.fy = transform.invertY(currentEvent.subject.y);
    }

    function dragged(currentEvent) {
        currentEvent.subject.fx = transform.invertX(currentEvent.x);
        currentEvent.subject.fy = transform.invertY(currentEvent.y);
    }

    function dragended(currentEvent) {
        if (!currentEvent.active) simulation.alphaTarget(0);
        currentEvent.subject.fx = null;
        currentEvent.subject.fy = null;
    }

    function resize() {
        ({ width, height } = canvas);
        fitToContainer(canvas);
    }
    function fitToContainer(node) {
        dpi = window.devicePixelRatio || 1;
        // Make it visually fill the positioned parent
        node.style.width = "100%";
        node.style.height = "100%";
        // ...then set the internal size to match
        node.width = node.offsetWidth * dpi;
        node.height = node.offsetHeight * dpi;
        width = node.offsetWidth * dpi;
        height = node.offsetHeight * dpi;
    }
</script>

<svelte:window on:resize={resize} />

<div on:resize={resize} class="container">
    {#if activeNode}
        <breadcrumb id="nodeDetails">
            <strong>{activeNode.id.split(/(?=[A-Z])/).join(" ")}</strong>
            <br />
            {#if activeNode.details}
                {#each Object.entries(activeNode.details) as detail}
                    {detail[0]}:
                    {detail[1]}
                    <br />
                {/each}
            {/if}
            <linkList>
                {#each activeNodeLinks as l}
                    {l.target}: {l._value} <br />
                {/each}
            </linkList>
        </breadcrumb>
    {/if}
    <canvas use:fitToContainer bind:this={canvas} />
</div>

<style>
    canvas {
        float: left;
    }
    .container {
        width: 100%;
        height: 100%;
        position: relative;
    }
    #nodeDetails {
        position: absolute;
        top: 1%;
        left: 1%;
        width: unset;
        color: #000;
    }
</style>
