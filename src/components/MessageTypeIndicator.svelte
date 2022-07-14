<script lang="ts">
    import { WhatsAppMessageType } from "../types/WhatsAppMessageType.enum";

    export let type: WhatsAppMessageType;

    let label = "unknown type";

    $: {
        label =
            getEmoji(type) +
                " " +
                Object.keys(WhatsAppMessageType)[
                    Object.values(WhatsAppMessageType).indexOf(type)
                ] ?? "⚠️ unknown type";
    }

    const getEmoji = (type: WhatsAppMessageType) => {
        switch (type) {
            case WhatsAppMessageType.Audio:
                return "🔊";
            case WhatsAppMessageType.ContactCard:
                return "📇";
            case WhatsAppMessageType.Document:
                return "📄";
            case WhatsAppMessageType.Gif:
                return "🌠";
            case WhatsAppMessageType.Image:
                return "📸";
            case WhatsAppMessageType.Location:
                return "📍";
            case WhatsAppMessageType.Sticker:
                return "🗯";
            case WhatsAppMessageType.Text:
                return "🖍";
            case WhatsAppMessageType.Video:
                return "📼";

            default:
                return "❓";
        }
    };
</script>

<messagetypeindicator class={type}>{label}</messagetypeindicator>

<style>
    messagetypeindicator {
        display: inline-block;

        padding: 4px;
        padding-right: 6px;
        border-radius: 4px;
        background-color: rgb(17, 16, 16);
    }

    /* TODO: adjust styling */
    messagetypeindicator:global(.undefined) {
        background-color: aqua;
    }

    messagetypeindicator:global(.text) {
        background-color: lightgray;
    }

    messagetypeindicator:global(.image) {
        background-color: lightgray;
    }

    messagetypeindicator:global(.video) {
        background-color: lightgray;
    }

    messagetypeindicator:global(.gif) {
        background-color: lightgray;
    }

    messagetypeindicator:global(.sticker) {
        background-color: lightgray;
    }

    messagetypeindicator:global(.audio) {
        background-color: lightgray;
    }

    messagetypeindicator:global(.location) {
        background-color: lightgray;
    }

    messagetypeindicator:global(.contactcard) {
        background-color: lightgray;
    }

    messagetypeindicator:global(.document) {
        background-color: lightgray;
    }
</style>
