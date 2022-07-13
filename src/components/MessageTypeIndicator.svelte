<script lang="ts">
import App from "../App.svelte";

    import { WhatsAppMessageType } from "../types/WhatsAppMessageType.enum";

    export let type: WhatsAppMessageType;

    let label = "unknown type";

    $: {
        label = getEmoji(type) + " " + Object.keys(WhatsAppMessageType)[Object.values(WhatsAppMessageType).indexOf(type)] ?? "⚠️ unknown type";
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
    }
</script>

<messagetypeindicator class={type}>
    {label}
</messagetypeindicator>

<style>
    messagetypeindicator {
        display: inline-block;

        padding: 4px;
        padding-right: 6px;
        border-radius: 4px;
        background-color: rgb(17, 16, 16);
    }

    /* TODO: fix */
    messagetypeindicator :global(.undefined) {
        background-color: aqua;
    }

    messagetypeindicator :global(.text) {
        background-color: lightgray;
    }
</style>
