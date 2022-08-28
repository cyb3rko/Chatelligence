import type { WhatsAppMessage } from "../types/WhatsAppMessage.type";
import type { Extraction } from "./processor.types";

export function extractByRegex(messages: WhatsAppMessage[], regex: RegExp, postProcess?: (extracted: string) => string): Extraction[] {
    /**
     * key: message
     *
     * value: mentions
     *  */
    const resultMap = new Map<string, WhatsAppMessage[]>();

    messages.forEach((m) => {
        Array.from(m.message.matchAll(regex)).forEach(url => {
            resultMap.set(url[0], [...(resultMap.get(url[0]) ?? []), m] ?? []);
        });
    });

    const result = Array.from(resultMap.entries()).map(([extracted, mentions]) => ({
        extracted,
        mentions,
    }));

    if (postProcess) {
        result.map(r => {
            r.extracted = postProcess(r.extracted);
            return r;
        });
    }

    return result;
}
