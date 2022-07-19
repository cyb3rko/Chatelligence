import moment from "moment";
import { WhatsAppMessageType } from "../types/WhatsAppMessageType.enum";
import { Parser, type ParserResult } from "./Parser";

export class DiscordJSONParser extends Parser {

    async parseRaw(raw: string): Promise<ParserResult> {
        const messages: DiscordJsonMessage[] = JSON.parse(raw)?.messages;

        const os = "discord";

        return {
            os,
            parsedMessages: messages.map(m => {
                return { sender: m.author?.name, message: m.content, time: moment(m.timestamp).toDate(), type: this.getMessageType(m.content) };
            })
        };
    }



    getMessageType(message: string): WhatsAppMessageType {
        return WhatsAppMessageType.Text;
    }

}

type DiscordJsonMessage = {
    "id": string,
    "type": string,
    "timestamp": string,
    "timestampEdited": string | null,
    "callEndedTimestamp": string | null,
    "isPinned": boolean,
    "content": string,
    "author": {
        "id": string,
        "name": string,
        "discriminator": string,
        "nickname": string,
        "color": string | null,
        "isBot": false,
        "avatarUrl": string
    },
    "attachments":
    {
        "id": string,
        "url": string,
        "fileName": string,
        "fileSizeBytes": number
    }[]
    ,
    "embeds": [],
    "stickers": [],
    "reactions": [],
    "mentions": []
}