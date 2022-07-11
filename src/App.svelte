<script lang="ts">
  import BarChart from "./Charts/BarChart.svelte";
  import MessageHoursBarChart from "./Charts/MessageHoursBarChart.svelte";
  import Evaluation from "./page/Evaluation.svelte";
  import { WhatsAppChatParser } from "./parser/WhatsAppChatParser";
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
    }
  };

  const parser = new WhatsAppChatParser();

  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    let result = e.target.result as string;

    parser
      .parseRaw(result)
      .then((parsed) => {
        messages = parsed;
        return messages;
      })
      .then(analyze)
      .then((result) => {
        analyis = result;
        console.log(analyis);
      });
  };

  $: {
    if (files && files[0]) {
      fileReader.readAsText(files[0]);
    }
  }

  async function analyze(messages: Message[]) {
    let sender = new Set(messages.map((m) => m.sender));

    /*
     * SENDER STATS
     */

    let senderStats = {};

    sender.forEach((s) => {
      senderStats[s] = {
        messageCount: 0,
        wordCount: 0,
        messageHours: Array.from<number>({ length: 24 }).fill(0),
      };
    });

    messages.forEach((m) => {
      senderStats[m.sender].messageCount++;
      senderStats[m.sender].wordCount += countWords(m.message);
      senderStats[m.sender].messageHours[m.time.getHours()]++;
    });

    let senderStatsArray = Object.keys(senderStats).map((s) => {
      return {
        sender: s,
        messageCount: senderStats[s].messageCount,
        wordCount: senderStats[s].wordCount,
        wordsPerMessage: senderStats[s].wordCount / senderStats[s].messageCount,
        messageHours: senderStats[s].messageHours as number[],
      };
    });

    /*
     * AVERAGE STATS
     */

    let averageSenderStats = {
      totalMessageCount: 0,
      avgMessageCount: 0, // per user
      totalWordCount: 0,
      avgWordCount: 0, // per user
      wordsPerMessage: 0,
      totalMessageHours: emptyArray(24, 0),
      avgMessageHours: emptyArray(24, 0), // per user
    };

    senderStatsArray.forEach((s) => {
      averageSenderStats.totalMessageCount += s.messageCount;
      averageSenderStats.totalWordCount += s.wordCount;
      s.messageHours.forEach((mh, i) => {
        averageSenderStats.totalMessageHours[i] += mh;
      });
    });

    averageSenderStats.avgMessageCount =
      averageSenderStats.totalMessageCount / senderStatsArray.length;
    averageSenderStats.avgWordCount =
      averageSenderStats.totalWordCount / senderStatsArray.length;
    averageSenderStats.totalMessageHours =
      averageSenderStats.totalMessageHours.map(
        (mh) => mh / senderStatsArray.length
      );

    return {
      sender,
      senderStats: senderStatsArray,
      averageSenderStats,
    };
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
        {files[0].name} ({Math.round(files[0].size / 1024)} kb | {messages.length}
        lines)
      </p>
      <p>
        frist message: {messages[0]}
      </p>
      <Evaluation senderStats={analyis?.senderStats} topMessanger={topMessanger} />
    {:else}
      <input type="file" bind:files accept=".txt" />
    {/if}
 </div>
</main>

<style>
  main {
  }
</style>
