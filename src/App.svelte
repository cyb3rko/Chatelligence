<script lang="ts">
    import { Router, Link, Route } from "svelte-routing";
    import type { ForcedNetworkGraphInput } from "./Charts/ForcedNetworkGraphInput.type";
    import ForceNetworkGraphCanvas from "./Charts/ForceNetworkGraphCanvas.svelte";
    import ChatMessage from "./components/Message.svelte";
    import NumberTransition from "./components/NumberTransition.svelte";
    import Evaluation from "./page/Evaluation.svelte";
    import type { WhatsAppMessage } from "./types/WhatsAppMessage.type";
    import { aggregate, top } from "./utils/array";
    import type { Counter } from "./utils/Counter";
    import type { Extraction } from "./utils/processor.types";
    import type { analyze, SenderStats } from "./webWorker/processor.worker";

    let files;
    /**
     * The operating system of the device the chat got exported from.
     */
    let os;

    let messages: WhatsAppMessage[] = [];
    let analysis: Awaited<ReturnType<typeof analyze>>;

    const worker = new Worker("build/processor.worker.js");
    let workerStatus;

    worker.onmessage = (m) => {
        console.log(m.data);
        switch (m.data[0]) {
            case "StatusUpdate":
                workerStatus = m.data[1] + (m.data[2] ? " " + m.data[2] : "");
                break;

            case "Messages":
                messages = m.data[1];
                break;

            case "Analysis":
                analysis = m.data[1];
                break;

            case "os":
                os = m.data[1];
                break;

            default:
                break;
        }
    };

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
        let result = e.target.result as string;

        worker.postMessage([result]);
    };

    $: {
        if (files && files[0]) {
            fileReader.readAsText(files[0]);
        }
    }

    let topMessanger: SenderStats;
    let aggregatedSenderStats: SenderStats;

    $: {
        topMessanger = analysis?.senderStats
            ? top(analysis.senderStats, 10, 0, "messageCount")
            : [];

        aggregatedSenderStats = analysis?.senderStats
            ? aggregate(
                  analysis.senderStats,
                  10,
                  "messageCount",
                  "sender",
                  true,
                  (a, e) => {
                      a.messageHours.forEach((v, i) => {
                          a.messageHours[i] += e.messageHours[i] ?? 0;
                      });
                  },
              )
            : [];
    }
</script>

<main>
    <Router>
        <Route path="/">
            <h1>Index</h1>
        </Route>
        <Route path="/app/*">
            <h1>Hello</h1>
            <div>
                {#if files && files[0]}
                    <p>
                        workerStatus: {workerStatus}
                    </p>
                    <p>
                        os: {os}
                    </p>
                    <p>
                        {files[0].name} (<NumberTransition
                            value={Math.round(files[0].size / 1024)}
                        />} kb |
                        <NumberTransition value={messages.length} />
                        messages)
                    </p>
                    <p>
                        frist message (Skipped system message): <ChatMessage
                            message={messages[1]}
                        />
                    </p>
                    <div />
                    {#if analysis}
                        <Evaluation
                            {analysis}
                            {aggregatedSenderStats}
                            {topMessanger}
                            emojsCounts={analysis.emojis.map((e) => {
                                return {
                                    label: e.extracted,
                                    value: e.mentions.length,
                                };
                            })}
                            participantsRelationReduced={analysis?.participantsRelationReduced}
                        />
                    {/if}
                {:else}
                    <input type="file" bind:files accept="txt/json" />
                {/if}
            </div>
        </Route>
    </Router>
</main>

<style>
    main {
    }

    :global(*) {
        --messageBGColor: #363637;
        --messageFontColor: #fdfdfd;
        --messageFont: Helvetica;
        --messageDateFontColor: #a2a2aa;
        --noData: red;
    }
</style>
