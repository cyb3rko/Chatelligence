import { WhatsAppChatParser } from "../parser/WhatsAppChatParser";
import type { Message } from "../types/Message.type";
import type { WhatsAppMessage } from "../types/WhatsAppMessage.type";
import { WhatsAppMessageType } from "../types/WhatsAppMessageType.enum";
import { emptyArray } from "../utils/array";
import { countWords } from "../utils/counting";

function print(...params: any) {
  console.log("[Worker 🔨]:", ...params);
}

const r_url = /(http|https)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
const r_phoneNumbers = /(^|\+|\s)+[0-9]{2,3}\s?[0-9]{2,14}\s?[0-9]{2,9}(\s|$|\u202c)/g;

// https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression (edited for uppercase cases)
const r_email = /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
const r_emoji = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
const r_socialHandles = /(^|\s)@(?=[a-zA-Z]+)[a-zA-Z0-9\.\#]+/g;

print("Hello World!");

const parser = [new WhatsAppChatParser()]

onmessage = (m) => {
  const data: string = m.data[0] as string;

  postMessage(["StatusUpdate", "Parsing"]);

  Promise.allSettled(parser.map(p => p.parseRaw(data)))
    .then(async (results) => {
      const errorMessages = results
        .filter(r => r.status === "rejected")
        .map(r => (r as PromiseRejectedResult).reason);

      // find the first successful parser
      const result = results.find(result => result.status === "fulfilled");

      if (result)
        return (result as PromiseFulfilledResult<WhatsAppMessage[]>).value;

      throw new Error("No parser could parse the file.\n" + errorMessages?.join("\n---\n"));
    })
    .then((parsed) => {
      postMessage(["StatusUpdate", "Analysing"]);
      postMessage(["Messages", parsed]);
      return parsed as WhatsAppMessage[];
    })
    .then(analyze)
    .then((result) => {
      postMessage(["StatusUpdate", "Done"]);
      postMessage(["Analysis", result]);
      console.log(result);
    });
}



async function analyze(messages: WhatsAppMessage[]) {
  let sender = new Set(messages.map((m) => m.sender));
  const textMessages = messages.filter((m) => m.type == WhatsAppMessageType.Text);

  /*
   * SENDER STATS
   */

  postMessage(["StatusUpdate", "Analysing", "sender specific data..."]);
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
    if (m.type == WhatsAppMessageType.Text)
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

  postMessage(["StatusUpdate", "Analysing", "average data..."]);

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

  postMessage(["StatusUpdate", "Analysing", "urls..."]);

  const urls = new Set();
  textMessages.forEach(m => {
    Array.from(m.message.matchAll(r_url)).forEach(url => {
      urls.add({ url: url[0], message: m });
    });
  })

  /**
   * Phone numbers
   */

  postMessage(["StatusUpdate", "Analysing", "phone numbers..."]);

  const phoneNumbers = new Set();
  textMessages.forEach(m => {
    Array.from(m.message.matchAll(r_phoneNumbers)).forEach(phone => {
      phoneNumbers.add({ phoneNumber: phone[0].trim(), message: m });
    });
  })

  /**
   * Email adresses
   */

  postMessage(["StatusUpdate", "Analysing", "adresses..."]);

  const emailAdresses = new Set();
  textMessages.forEach(m => {
    Array.from(m.message.matchAll(r_email)).forEach(email => {
      emailAdresses.add({ email: email[0], message: m });
    })
  })

  /**
   * Emojis
   */

  postMessage(["StatusUpdate", "Analysing", "emojis..."]);

  const emojis = new Map<string, number>();
  textMessages.forEach(m => {
    Array.from(m.message.matchAll(r_emoji)).forEach(emoji => {
      if (!['\u200D', '\u200E', '\u2019', "“", "„", "\u202C", "\u202A", "…", "—",].includes(emoji[0])) // Blacklist
        emojis.set(emoji[0], (emojis.get(emoji[0]) ?? 0) + 1);
    });
  });

  /**
   * Social Handles
   */

  postMessage(["StatusUpdate", "Analysing", "social handles..."]);

  const socialHandles = new Set();
  textMessages.forEach(m => {
    Array.from(m.message.matchAll(r_socialHandles)).forEach(handle => {
      socialHandles.add({ handle: handle[0], message: m });
    })
  })


  return {
    sender,
    senderStats: senderStatsArray,
    averageSenderStats,
    wordStatistics: await analyzeWords(textMessages),
    urls,
    phoneNumbers,
    emailAdresses,
    emojis,
    socialHandles,
  };
}

async function analyzeWords(messages: Message[]) {

  postMessage(["StatusUpdate", "Analysing", "words..."]);
  const overallWordCount = new Map();

  const r_word = /[a-zA-Z]+/g;
  messages.forEach(m => {
    Array.from(m.message.matchAll(r_word)).forEach(word => {
      overallWordCount.set(word[0].toLowerCase(), (overallWordCount.get(word[0].toLowerCase()) ?? 0) + 1);
    });
  })
  return { overallWordCount }
}