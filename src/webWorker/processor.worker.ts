import { WhatsAppChatParser } from "../parser/WhatsAppChatParser";
import type { Message } from "../types/Message.type";
import { emptyArray } from "../untils/array";
import { countWords } from "../untils/counting";

function print(...params: any) {
    console.log("[Worker 🔨]:", ...params);
}

const r_url = /(http|https)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const r_phoneNumbers = /(\^|\+|\s)+[0-9]{2,3}\s?[0-9]{2,14}\s?[0-9]{2,9}(\s|$|\u202c)/;

// https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression (edited for uppercase cases)
const r_email = /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const r_emoji = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

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


    /**
     * URL finder
     */
    const urls = new Set();
    messages.forEach(m => {
        let match = m.message.match(r_url);
        
        if(match) urls.add({url: match[0], message: m});
    })

    /**
     * Phone numbers
     */
    const phoneNumbers = new Set();
    messages.forEach(m => {
        let match = m.message.match(r_phoneNumbers);
        
        if(match) phoneNumbers.add({phoneNumber: match[0], message: m});
    })

    /**
     * Phone numbers
     */
     const emailAdresses = new Set();
     messages.forEach(m => {
         let match = m.message.match(r_email);
         
         if(match) emailAdresses.add({email: match[0], message: m});
     })

     /**
      * Emojis
      */
    const emojis = new Map();
    messages.forEach(m  => {
      Array.from(m.message.matchAll(r_emoji)).forEach(emoji => {
        emojis.set(emoji[0], (emojis.get(emoji[0]) ?? 0) + 1);
      });
    });


    return {
      sender,
      senderStats: senderStatsArray,
      averageSenderStats,
      wordStatistics: await analyzeWords(messages),
      urls,
      phoneNumbers,
      emailAdresses,
      emojis,
    };
  }

  async function analyzeWords(messages: Message[]) {
    const overallWordCount = new Map();

    let temp = "";
    messages.forEach(m => {
        m.message.split(" ").forEach(w => {
            temp = w.trim()
            overallWordCount.set(temp, (overallWordCount.get(temp) ?? 0) + 1);
        })
    })
    return { overallWordCount }
  }