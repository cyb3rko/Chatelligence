export enum WhatsAppMessageType {
    Text = "text",
    Image = "image",
    Video = "video",
    Gif = "gif",
    Sticker = "sticker",
    Audio = "audio",
    Location = "location",
    ContactCard = "contactcard",
    Document = "document",
    /**
     * Ugly android wildcard for all messages that are not text.
     */
    Media = "media",
}