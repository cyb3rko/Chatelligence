import { languageOfAWord } from "../Language/Language";
import { DiscordJSONParser } from "../parser/DiscordJSONParser";
import type { ParserResult } from "../parser/Parser";
import { WhatsAppChatParser } from "../parser/WhatsAppChatParser";
import type { Message } from "../types/Message.type";
import type { WhatsAppMessage } from "../types/WhatsAppMessage.type";
import { WhatsAppMessageType } from "../types/WhatsAppMessageType.enum";
import { emptyArray } from "../utils/array";
import { generateColorFromString } from "../utils/color";
import { Counter } from "../utils/Counter";
import { countWords } from "../utils/counting";
import type { Extraction } from "../utils/processor.types";
import { extractByRegex } from "../utils/processorUtils";

function print(...params: any) {
  console.log("[Worker 🔨]:", ...params);
}

const r_url = /(http|https)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
const r_phoneNumbers = /(^|\+|\s)+[0-9]{2,3}\s?[0-9]{2,14}\s?[0-9]{2,9}(\s|$|\u202c)/g;

// https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression (edited for uppercase cases)
const r_email = /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
// 🇺  🇳  🇮  🇨  🇴  🇩  🇪    🇷  🇪  🇵  🇴  🇷  🇹  https://unicode.org/reports/tr51/
const r_emoji = /(?=\D)(?=[^\*])[\p{Emoji}][\p{Emoji_Modifier}\u200D\u2640-\u2642]*(\u200D\p{Emoji})*/ug
const r_emojiModifier = /[\p{Emoji_Modifier}\u200D\u2640-\u2642]/ug;
const r_emojiModifierGender = /(\u2640|\u2642)/;
/**
 * Only emojis that are explicitly male (Without an modifier)
 */
const r_emojiMale = /👴/ug;
/**
 * Only emojis that are explicitly female. (Without an modifier)
 */
const r_emojiFemale = /👵/ug;
const r_socialHandles = /(^|\s)@(?=[a-zA-Z]+)[a-zA-Z0-9\.\#]+|(^|\s)[a-zA-Z0-9\-]+#\d+/g;
const r_words = /(?:[\p{L}'’]+(?![\u{1F000}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]))/gu;

export type Analysis = Awaited<ReturnType<typeof analyze>>;
export type SenderStats = Analysis["senderStats"];

print("Hello World!");

const parser = [new WhatsAppChatParser(), new DiscordJSONParser()]

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

      if (result) {
        postMessage(["os", (result as PromiseFulfilledResult<ParserResult>).value.os]);
        return (result as PromiseFulfilledResult<ParserResult>).value.parsedMessages;
      }

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
    }).catch(err => {
      postMessage(["error", err]);
    });
}



export async function analyze(messages: WhatsAppMessage[]) {
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
      color: generateColorFromString(s)
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
  const urls = extractByRegex(textMessages, r_url);

  /**
   * Phone numbers
   */

  postMessage(["StatusUpdate", "Analysing", "phone numbers..."]);
  const phoneNumbers = extractByRegex(textMessages, r_phoneNumbers, (n) => n.trim());

  /**
   * Email adresses
   */

  postMessage(["StatusUpdate", "Analysing", "Addresses..."]);
  const emailAddresses = extractByRegex(textMessages, r_email);

  /**
   * Emojis
   */

  postMessage(["StatusUpdate", "Analysing", "emojis..."]);

  const emojis = extractByRegex(textMessages, r_emoji);
  const emojiModifiers = extractByRegex(textMessages, r_emojiModifier);

  /**
   * Social Handles
   */

  postMessage(["StatusUpdate", "Analysing", "social handles..."]);

  const socialHandles = extractByRegex(textMessages, r_socialHandles, (h) => h.trim());

  /**
   * Relation of participants
   */
  postMessage(["StatusUpdate", "Analysing", "relation of participants..."]);
  /**
   * key: source.target
   * value: value of the relation
   */
  const participantsRelationMap = new Map<string, number>();
  /**
   * the authors of the last 3 messages
   */
  let t_last3sender = [];
  let t_key;
  textMessages.forEach(m => {
    t_last3sender.forEach(s => {
      if (s != m.sender) {
        t_key = `${s}\uffff${m.sender}`;
        participantsRelationMap.set(t_key, (participantsRelationMap.get(t_key) ?? 0) + 1);
      }
    }
    );

    t_last3sender.unshift(m.sender);
    if (t_last3sender.length > 3)
      t_last3sender.pop();
  });

  /**
   * The value of the relation is the number of messages between the two participants with a maximum distance of 3 messages apparat
   */
  const participantsRelation = {
    nodes: Array.from(senderStatsArray.values()).map((s, i) => { return { id: s.sender, group: i, color: s.color } }),
    links: Array.from(participantsRelationMap.entries()).map(([key, value]) => {
      const [source, target] = key.split("\uffff");
      return { source, target, value, _value: value };
    }).filter((l) => l.source != l.target),
  };
  postMessage(["StatusUpdate", "Reducing", "relation of participants..."]);
  const participantsRelationReduced = {
    nodes: participantsRelation.nodes,
    links: participantsRelation.links.map(l => {
      return { source: l.source, target: l.target, value: Math.log10(l.value), _value: l.value };
    }),
  };

  if (sender.size > 12)
    participantsRelationReduced.links = participantsRelationReduced.links.filter(l => l._value > messages.length / (sender.size * 5));

  /**
   * MessageTypes
   */
  postMessage(["StatusUpdate", "Analysing", "message types..."]);
  const messageTypes = new Map<string, number>();
  messages.forEach(m => {
    messageTypes.set(m.type, (messageTypes.get(m.type) ?? 0) + 1);
  });

  /**
   * Words
   */
  postMessage(["StatusUpdate", "Analysing", "words..."]);
  const words = extractByRegex(textMessages, r_words);

  /**
   * Language Analysis
   */
  postMessage(["StatusUpdate", "Analysing", "languages..."]);
  let lang = "unknown";
  const senderLanguages: { [sender: string]: { [lang: string]: number } } = {};
  const globalLanguages: { [lang: string]: number } = {}
  senderStatsArray.forEach(s => senderLanguages[s.sender] = {})
  textMessages.forEach(txt => {
    txt.message.split(" ").forEach(word => {
      lang = languageOfAWord(word);
      senderLanguages[txt.sender][lang] = (senderLanguages[txt.sender][lang] ?? 0) + 1;
      globalLanguages[lang] = (globalLanguages[lang] ?? 0) + 1;
    });
  });

  // Make the values relative
  Object.entries(senderLanguages).forEach(([_sender, langs]) => {
    let sum = Object.values(langs).reduce((p, c) => p + c, 0);
    Object.entries(langs).forEach(([lang, strength]) => {
      langs[lang] = strength / sum;
    });
  });

  let globalLanguagesSum = Object.entries(globalLanguages).reduce((p, c) => p + c[1], 0);
  Object.entries(globalLanguages).forEach((([lang, strength]: [string, number]) => {
    globalLanguages[lang] = strength / globalLanguagesSum;
  }));


  return {
    sender,
    senderStats: senderStatsArray,
    averageSenderStats,
    wordStatistics: await analyzeWords(textMessages),
    urls,
    phoneNumbers,
    emailAddresses,
    participantsRelation,
    participantsRelationReduced,
    emojis,
    emojiModifiers,
    emojiModifierBasedSenderStats: emojiBasedSenderStats(Array.from(sender), emojiModifiers, emojis),
    socialHandles,
    messageTypes,
    words,
    senderLanguages,
    globalLanguages
  };
}

function emojiBasedSenderStats(senders: string[], emojisModifiers: Extraction[], emojis: Extraction[]) {
  const senderMap = new Map(senders.map(s => {
    return [s, new Map()]
  }));

  const genderAssumption = new Counter(senders);
  const genderVersatility = new Counter(senders);

  emojisModifiers.forEach(modifier => {
    modifier.mentions.forEach(mention => {
      let sendersEmojiMap = senderMap.get(mention.sender);
      if (!sendersEmojiMap.get(modifier.extracted))
        sendersEmojiMap.set(modifier.extracted, [])

      sendersEmojiMap.get(modifier.extracted).push(mention);

      if (r_emojiModifierGender.test(modifier.extracted)) {
        genderVersatility.increase(mention.sender);

        switch (modifier.extracted) {
          case "♂":
            genderAssumption.decrease(mention.sender);
            break;

          case "♀":
            genderAssumption.increase(mention.sender);
            break;

          default:
            break;
        }
      }
    });
  });

  emojis.forEach(e => {
    if (r_emojiMale.test(e.extracted)) {
      e.mentions.forEach(m => {
        genderVersatility.increase(m.sender);
        genderAssumption.decrease(m.sender);
      })
    } else if (r_emojiFemale.test(e.extracted)) {
      e.mentions.forEach(m => {
        genderVersatility.increase(m.sender);
        genderAssumption.increase(m.sender);
      })
    }
  })

  senders.forEach(s => {
    genderVersatility.decrease(s, Math.abs(genderAssumption.get(s)))
  });

  return {
    senderMap,
    /**
     * value < 0 male
     *
     * value > 0 female
     */
    genderAssumption,
    /**
     * the larger the count the bigger the versatility
     */
    genderVersatility
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