<script lang="ts">
    import { Link, navigate, Route, Router } from "svelte-routing";
    import {
        Collapse,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        Nav,
        Navbar,
        NavbarBrand,
        NavbarToggler,
        NavItem,
        NavLink,
        Styles,
    } from "sveltestrap";
    import ChatMessage from "./components/Message.svelte";
    import NumberTransition from "./components/NumberTransition.svelte";
    import { StoreAnalysis } from "./DataStore";
    import Evaluation from "./page/Evaluation.svelte";
    import Person from "./page/Person.svelte";
    import type { WhatsAppMessage } from "./types/WhatsAppMessage.type";
    import { aggregate, top } from "./utils/array";
    import type { analyze, SenderStats } from "./webWorker/processor.worker";

    let files;
    /**
     * The operating system of the device the chat got exported from.
     */
    let os;

    let messages: WhatsAppMessage[] = [];
    let analysis: Awaited<ReturnType<typeof analyze>>;

    const worker = new Worker("/build/processor.worker.js");
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
                worker.terminate();
                analysis = m.data[1];
                StoreAnalysis.set(m.data[1]);
                navigate("/app/overview", { replace: true });
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

    let isOpenNavbar = false;
</script>

<main>
    <Styles />
    <Router>
        <Navbar color="light" light expand="md">
            <NavbarBrand href="/app"
                >{files?.[0]?.name ?? "ChatStat"}</NavbarBrand
            >
            <NavbarToggler on:click={() => (isOpenNavbar = !isOpenNavbar)} />
            <Collapse isOpen={isOpenNavbar} navbar expand="md">
                <Nav class="ms-auto" navbar>
                    {#if analysis != undefined}
                        <NavItem>
                            <NavLink on:click={() => navigate("/app/overview/")}
                                >Übersicht</NavLink
                            >
                        </NavItem>
                        <Dropdown nav inNavbar>
                            <DropdownToggle nav caret>Options</DropdownToggle>
                            <DropdownMenu end>
                                <DropdownItem
                                    >//TODO: Adjust colors</DropdownItem
                                >
                                <DropdownItem divider />
                                <DropdownItem
                                    on:click={() => {
                                        navigate("/app/");
                                        location.reload();
                                    }}>Reset</DropdownItem
                                >
                            </DropdownMenu>
                        </Dropdown>
                    {/if}
                </Nav>
            </Collapse>
        </Navbar>
        <Route path="/">
            <h1>Index</h1>
        </Route>
        <Route path="/app/*">
            <h1>Hello</h1>
            <div>
                {#if files && files[0]}
                    <Router>
                        <Route path="/person/:id" let:params>
                            <Person {analysis} id={params.id} />
                        </Route>
                        <Route path="/overview">
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
                        </Route>
                    </Router>
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
