<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import { top } from '../untils/array';

  export let data: { value: number, label: string }[] = [];

  let chart;
  onMount(() => {
    let rdata = top(data, 15, "value");
    let highest = Math.max(...rdata.map(d => d.value));
    console.log(rdata);
    
		d3.select(chart)
			.selectAll("div")
			.data(rdata)
			.enter()
			.append("div")
			.style("width", function(d) {
				return (100 * d.value / highest) + "%";
			})
			.text(function(d) {
				return  `${d.label} ${d.value}`;
			});
	});
</script>

<lineChart bind:this={chart}>
</lineChart>

<style>
  lineChart {
    width: 100%;
  }

  lineChart :global(div) {
    font-size: 16px;
    padding: 3px;
    margin-top: 2px;
    background-color: aquamarine;
    white-space: nowrap;
    box-sizing: border-box;
    border-radius: 6px;
  }
</style>
