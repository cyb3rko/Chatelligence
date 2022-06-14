<script lang="ts">
  import type { Message } from "./types/Message.type";
  import moment from "moment";
  import BarChart from "./Charts/BarChart.svelte";

  let files;

  let messages = [];
  let analyis;

  /**
   * regex to match the time stamp
   * a.e. "[31.10.21, 11:58:58]"
   */
  const r_Time =
    /^(\u200e)*(\[)([0-9]{2}(\.)){2}[0-9]{2}(,)\s{1}[0-2][0-9](:)[0-5][0-9](:)[0-5][0-9](\])/;
  const rg_TimeAndName =
    /(\u200e)*(\[)([0-9]{2}(\.)){2}[0-9]{2}(,)\s{1}[0-2][0-9](:)[0-5][0-9](:)[0-5][0-9](\])(\s){1}[^:]+(: ){1}/g;

  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    let result = e.target.result as string;

    parseRawChat(result)
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

  // TODO: parse special messages beginning with an U+200E
  async function parseRawChat(raw: string): Promise<Message[]> {
    let parsedMessages = [];
    Array.from(raw.matchAll(rg_TimeAndName)).forEach((match) => {
      let m = match.at(0);
      let time = m.match(r_Time).at(0);
      time = time.substring(1, time.length - 1);
      let sender = m.substring(time.length + 3, m.length - 2);
      let lastMessage = parsedMessages[parsedMessages.length - 1];
      if (lastMessage) {
        lastMessage.length = lastMessage.length - 1;
        parsedMessages[parsedMessages.length - 1].message = raw.substring(
          lastMessage.index + lastMessage.length + 1,
          match.index
        );
      }
      parsedMessages.push({
        sender,
        time,
        index: match.index,
        length: m.length,
      });
    });

    let lastMessage = parsedMessages[parsedMessages.length - 1];
    parsedMessages[parsedMessages.length - 1].message = raw.substring(
      lastMessage.index + lastMessage.length + 1
    );
    return parsedMessages.map((m) => ({
      sender: m.sender,
      time: moment(m.time, "DD-MM-YYYY, HH:mm:ss").toDate(),
      message: m.message,
    }));
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
      senderStats[m.sender].wordCount += wordCount(m.message);
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
      totalMessageHours: Array.from<number>({ length: 24 }).fill(0),
      avgMessageHours: Array.from<number>({ length: 24 }).fill(0), // per user
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

  const wordCount = (str: string) => {
    return str.split(/\s+/).length;
  };

  let exampleData = {
    labels: ["0 - 0:59", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23 - 23:59"],
    datasets: [],
  };

  $: {
    if (analyis?.senderStats) {
      let x = exampleData;

      x.datasets = [];

      x.datasets.push(
        ...analyis.senderStats.map((s) => {
          return {
            label: s.sender,
            data: s.messageHours.map((v) => {
              return v;
            }),
            backgroundColor:
              "#" + Math.floor(Math.random() * 16777215).toString(16),
          };
        })
      );
        console.log(x);
      exampleData = x;
    }
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
    {:else}
      <input type="file" bind:files accept=".txt" />
    {/if}

    <BarChart data={exampleData} />
  </div>
</main>

<style>
  main {
  }
</style>
