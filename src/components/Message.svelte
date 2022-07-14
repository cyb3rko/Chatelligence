<script lang="ts">
    import moment from "moment";
    import type { WhatsAppMessage } from "../types/WhatsAppMessage.type";
    import type { WhatsAppMessageType } from "../types/WhatsAppMessageType.enum";
    import MessageTypeIndicator from "./MessageTypeIndicator.svelte";

    export let message: WhatsAppMessage;

    let content: string;
    let sender: string;
    let time: Date;
    let type: WhatsAppMessageType;

    $: {
        content = message?.message;
        sender = message?.sender;
        time = message?.time;
        type = message?.type;
    }
</script>

<message>
    <MessageTypeIndicator {type} />
    <sender class={sender ? "ok" : "empty"}>{sender ?? "⚠️ No sender."}</sender>
    <br />
    <content class={content ? "ok" : "empty"}
        >{content ?? "⚠️ No content."}</content
    >
    <date class={time ? "ok" : "empty"}
        >{time
            ? moment(time).format("(dd) DD.MM.YYYY hh:mm")
            : "⚠️ No date."}</date
    >
</message>

<style>
    .empty {
        font-weight: bold;
        color: var(--noData);
    }

    sender {
        display: inline-block;
    }

    message {
        display: inline-block;
        position: relative;

        padding: 8px;
        padding-bottom: 16px;

        /* prevent overflow of the date element */
        min-width: 116px;

        background-color: var(--messageBGColor);
        color: var(--messageFontColor);
        font-family: var(--messageFont);
        font-size: 1em;
        border-radius: 8px;
    }

    date {
        position: absolute;
        color: var(--messageDateFontColor);
        white-space: nowrap;
        right: 8px;
        bottom: 5px;
        font-size: 0.6em;
    }
</style>
