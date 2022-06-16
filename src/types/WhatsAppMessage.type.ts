import type { Message } from "./Message.type";
import type { WhatsAppMessageType } from "./WhatsAppMessageType.enum";

export type WhatsAppMessage = Message & {
    type: WhatsAppMessageType,
}
