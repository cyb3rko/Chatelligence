import type { WhatsAppMessage } from "../types/WhatsAppMessage.type";

export abstract class Parser {
    abstract parseRaw(raw: string): Promise<ParserResult>;
}

export type ParserResult = { os: string, parsedMessages: WhatsAppMessage[] };