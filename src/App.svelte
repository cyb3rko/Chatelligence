<script lang="ts">
  import Evaluation from "./page/Evaluation.svelte";
  import type { Message } from "./types/Message.type";
  import type { WhatsAppMessage } from "./types/WhatsAppMessage.type";
  import { emptyArray, top } from "./untils/array";
  import { countWords } from "./untils/counting";

  let files;

  let messages: WhatsAppMessage[] = [];
  let analyis: {
    sender: Set<string>;
    senderStats: {
        sender: string;
        messageCount: any;
        wordCount: any;
        wordsPerMessage: number;
        messageHours: number[];
    }[];
    averageSenderStats: {
      totalMessageCount: number;
      avgMessageCount: number;
    totalWordCount: number;
    avgWordCount: number;
    wordsPerMessage: number;
    totalMessageHours: number[];
    avgMessageHours: number[];
    };
    emojis: Map<string, number>;
  };

  const worker = new Worker("build/processor.worker.js");
  let workerStatus;

  worker.onmessage = (m) => {
    console.log(m.data);
    switch (m.data[0]) {
      case "StatusUpdate":
        workerStatus = m.data[1];
        break;

      case "Messages":
        messages = m.data[1]
        break;
      
      case "Analysis":
        analyis = m.data[1]
        break;
    
      default:
        break;
    }
  };

  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    let result = e.target.result as string;

    worker.postMessage([result]);
  };

  $: {
    if (files && files[0]) {
      fileReader.readAsText(files[0]);
    }
  }

  let topMessanger: {
    sender: string;
    messageCount: any;
    wordCount: any;
    wordsPerMessage: number;
    messageHours: number[];
  }[];

  $: {
    topMessanger = analyis?.senderStats ? top(analyis.senderStats, 10, "messageCount") : [];
  }
</script>

<main>
  <h1>Hello</h1>
  <div>
    {#if files && files[0]}
      <p>
        workerStatus: { workerStatus }
      </p>
      <p>
        {files[0].name} ({Math.round(files[0].size / 1024)} kb | {messages.length}
        lines)
      </p>
      <p>
        frist message: {messages[0]}
      </p>
      <Evaluation 
        senderStats={analyis?.senderStats}
        topMessanger={topMessanger}
        emojsCounts={analyis?.emojis ? Array.from(analyis?.emojis?.entries()).map(e => { return { value: e[1], label: e[0] } }) : []} />
    {:else}
      <input type="file" bind:files accept=".txt" />
    {/if}
 </div>
</main>

<style>
  main {
  }
</style>
