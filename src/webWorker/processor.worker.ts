import { WhatsAppChatParser } from "../parser/WhatsAppChatParser";
import type { Message } from "../types/Message.type";
import { emptyArray } from "../untils/array";
import { countWords } from "../untils/counting";

function print(...params: any) {
    console.log("[Worker 🔨]:", ...params);
}

print("Hello World!");

const parser = new WhatsAppChatParser();

onmessage = (m) => {
    const data: string = m.data[0] as string;

    postMessage(["StatusUpdate", "Parsing"]);

    parser
    .parseRaw(data)
    .then((parsed) => {
      postMessage(["StatusUpdate", "Analysing"]);
      postMessage(["Messages", parsed]);
      return parsed;
    })
    .then(analyze)
    .then((result) => {
      postMessage(["StatusUpdate", "Done"]);
      postMessage(["Analysis", result]);
      console.log(result);
    });
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
