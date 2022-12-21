<script lang="ts">
    import { navigate, Route, Router } from "svelte-routing";
    import {
        Alert,
        Button,
        Card,
        CardBody,
        CardHeader,
        CardTitle,
        Collapse,
        Container,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        Input,
        ListGroup,
        ListGroupItem,
        Nav,
        Navbar,
        NavbarBrand,
        NavbarToggler,
        NavItem,
        NavLink,
        Spinner,
        Styles,
    } from "sveltestrap";
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
    let workerError;

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

            case "error":
                workerStatus = "error";
                workerError = m.data[1];
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
        <Navbar color="dark" dark expand="md">
            <NavbarBrand href="/app"
                >{files?.[0]?.name ?? "ChatStat"}</NavbarBrand
            >
            <NavbarToggler on:click={() => (isOpenNavbar = !isOpenNavbar)} />
            <Collapse isOpen={isOpenNavbar} navbar expand="md">
                <Nav class="ms-auto" navbar>
                    {#if analysis != undefined}
                        <NavItem>
                            <NavLink
                                on:click={() => navigate("/app/overview/")}
                                color="danger">Übersicht</NavLink
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
        <Container style="padding-top: 2rem;">
            <Route path="/">
                <h1>Index</h1>
            </Route>
            <Route path="/app/*">
                <div>
                    {#if files && files[0]}
                        <Router>
                            <Route path="/person/:id" let:params>
                                <Person {analysis} id={params.id} />
                            </Route>
                            <Route path="/overview">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>System</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <ListGroup>
                                            <ListGroupItem
                                                color={workerStatus == "Done"
                                                    ? "success"
                                                    : workerStatus == "error"
                                                    ? "danger"
                                                    : "light"}
                                            >
                                                {#if workerStatus != "Done" && workerStatus != "error"}
                                                    <Spinner
                                                        color="info"
                                                        size="sm"
                                                    />
                                                {/if}
                                                Worker-Status: {workerStatus}
                                            </ListGroupItem>
                                            <ListGroupItem
                                                color={os != undefined
                                                    ? "success"
                                                    : "light"}
                                            >
                                                os: {os}
                                            </ListGroupItem>
                                            <ListGroupItem
                                                color={files?.[0].size !=
                                                undefined
                                                    ? "success"
                                                    : "light"}
                                            >
                                                Filesize: {Math.round(
                                                    files[0].size / 1024,
                                                )}kb
                                            </ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>

                                {#if workerStatus == "error"}
                                    <br />
                                    <Alert color="danger">
                                        <h4
                                            class="alert-heading text-capitalize"
                                        >
                                            Worker error
                                        </h4>
                                        <Button
                                            color="primary"
                                            on:click={() => location.reload()}
                                            >Try again</Button
                                        >
                                        <br />
                                        <br />

                                        {workerError}
                                    </Alert>
                                {/if}

                                {#if analysis}
                                    <br /><br />
                                    <Evaluation
                                        messageCount={messages.length}
                                        {analysis}
                                        {aggregatedSenderStats}
                                        {topMessanger}
                                        emojsCounts={analysis.emojis.map(
                                            (e) => {
                                                return {
                                                    label: e.extracted,
                                                    value: e.mentions.length,
                                                };
                                            },
                                        )}
                                        participantsRelationReduced={analysis?.participantsRelationReduced}
                                    />
                                {/if}
                            </Route>
                        </Router>
                    {:else}
                        <Card>
                            <CardBody>
                                <h1>Upload</h1>
                                <Input
                                    type="file"
                                    bind:files
                                    accept="txt/json"
                                />
                            </CardBody>
                        </Card>
                    {/if}
                </div>
            </Route>
        </Container>
    </Router>

    <br /><br />
</main>

<style>
    main {
    }

    :global(*) {
        --messageBGColor: #363637;
        --messageFontColor: #fdfdfd;
        --messageFont: Helvetica;
        --messageDateFontColor: #a2a2aa;
        --noData: #dc3545;
    }
</style>
