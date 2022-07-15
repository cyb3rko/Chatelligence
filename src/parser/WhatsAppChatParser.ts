import moment from "moment";
import type { WhatsAppMessage } from "../types/WhatsAppMessage.type";
import { WhatsAppMessageType } from "../types/WhatsAppMessageType.enum";
import { Parser } from "./Parser";

export class WhatsAppChatParser extends Parser {

    /**
     * regex to match the time stamp
     * a.e. "[31.10.21, 11:58:58]" or "31.10.21, 11:58:58" or "31/10/21, 11:58:58"
     */
    r_Time = /(\u200e)?(\[?\d{2}(\.|\/)\d{2}(\.|\/)\d{2,4}\, \d{2}\:\d{2}(\:\d{2})?\]?)/g;
    rg_TimeAndName =
        /(\u200e)?(\[?\d{2}(\.|\/)\d{2}(\.|\/)\d{2,4}\, \d{2}\:\d{2}(\:\d{2})?\]?)(\s){1}[^:]+(: ){1}/g;


    // TODO: parse "system" messages from groups (without sender).
    async parseRaw(raw: string): Promise<WhatsAppMessage[]> {
        let parsedMessages = [];
        Array.from(raw.matchAll(this.rg_TimeAndName)).forEach((match) => {
            let m = match.at(0);
            let time = m.match(this.r_Time).at(0);
            if (time.startsWith("["))
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

        console.log(parsedMessages[0].time);

        const dateString = (parsedMessages[0].time as string);

        return parsedMessages.map((m) => ({
            type: this.getMessageType(m.message), // TODO: parse special messages
            sender: m.sender,
            time: moment(m.time, "DD-MM-YYYY, HH:mm:ss").toDate(),
            message: m.message,
        }));
    }

    r_sticker = /\u200e(sticker omitted)/;
    r_image = /\u200e(image omitted)/;
    r_video = /\u200e(video omitted)/;
    r_gif = /\u200e(GIF omitted)/;
    r_audio = /\u200e(audio omitted)/;
    r_location = /\u200e(Location\: https\:\/\/maps\.google\.com\/\?q\=)\d+\.\d+\,\d+\.\d+/;
    r_contactCard = /\u200e(Contact card omitted)/;
    r_document = /\u200e(document omitted)/;
    r_media = /\A\<(Media omitted)\>\Z/;

    getMessageType(message: string): WhatsAppMessageType {
        if (message.match(this.r_media)) return WhatsAppMessageType.Media;
        if (message.match(this.r_sticker)) return WhatsAppMessageType.Sticker;
        if (message.match(this.r_image)) return WhatsAppMessageType.Image;
        if (message.match(this.r_video)) return WhatsAppMessageType.Video;
        if (message.match(this.r_gif)) return WhatsAppMessageType.Gif;
        if (message.match(this.r_audio)) return WhatsAppMessageType.Audio;
        if (message.match(this.r_location)) return WhatsAppMessageType.Location;
        if (message.match(this.r_contactCard)) return WhatsAppMessageType.ContactCard;
        if (message.match(this.r_document)) return WhatsAppMessageType.Document;

        return WhatsAppMessageType.Text;
    }

}