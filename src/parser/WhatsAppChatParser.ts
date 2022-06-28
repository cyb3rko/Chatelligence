import moment from "moment";
import type { Message } from "../types/Message.type";
import type { WhatsAppMessage } from "../types/WhatsAppMessage.type";
import { WhatsAppMessageType } from "../types/WhatsAppMessageType.enum";
import { Parser } from "./Parser";

export class WhatsAppChatParser extends Parser {

    /**
     * regex to match the time stamp
     * a.e. "[31.10.21, 11:58:58]"
     */
    r_Time =
        /^(\u200e)*(\[)([0-9]{2}(\.)){2}[0-9]{2}(,)\s{1}[0-2][0-9](:)[0-5][0-9](:)[0-5][0-9](\])/;
    rg_TimeAndName =
        /(\u200e)*(\[)([0-9]{2}(\.)){2}[0-9]{2}(,)\s{1}[0-2][0-9](:)[0-5][0-9](:)[0-5][0-9](\])(\s){1}[^:]+(: ){1}/g;


    // TODO: parse special messages beginning with an U+200E
    // TODO: This is CPU blocking -> use a worker
    async parseRaw(raw: string): Promise<WhatsAppMessage[]> {
        let parsedMessages = [];
        Array.from(raw.matchAll(this.rg_TimeAndName)).forEach((match) => {
            let m = match.at(0);
            let time = m.match(this.r_Time).at(0);
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
            type: WhatsAppMessageType.Text, // TODO: parse special messages
            sender: m.sender,
            time: moment(m.time, "DD-MM-YYYY, HH:mm:ss").toDate(),
            message: m.message,
        }));
    }

}