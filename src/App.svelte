<script lang="ts">
  let files;

  let messages = [];

  /**
   * regex to match the time stamp
   * a.e. "[31.10.21, 11:58:58]"
   */
  const r_Time =
    /^(\u200e)*(\[)([0-9]{2}(\.)){2}[0-9]{2}(,)\s{1}[0-2][0-9](:)[0-5][0-9](:)[0-5][0-9](\])/;
  const rg_TimeAndName =
    /(\u200e)*(\[)([0-9]{2}(\.)){2}[0-9]{2}(,)\s{1}[0-2][0-9](:)[0-5][0-9](:)[0-5][0-9](\])(\s){1}[^:]+(: ){1}/g;

  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    let result = e.target.result as string;

    Array.from(result.matchAll(rg_TimeAndName)).forEach((match) => {
      let m = match.at(0);
      let time = m.match(r_Time).at(0);
      time = time.substring(1, time.length - 1);
      let sender = m.substring(time.length + 3, m.length - 2);

      let lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        lastMessage.length = lastMessage.length - 1;
        messages[messages.length - 1].message = result.substring(
          lastMessage.index + lastMessage.length + 1,
          match.index
        );
      }

      messages.push({ sender, time, index: match.index, length: m.length });
    });

    let lastMessage = messages[messages.length - 1];
    messages[messages.length - 1].message = result.substring(lastMessage.index + lastMessage.length + 1);

    console.log(messages);

    analyze(messages).then((result) => {
      console.log(result);
    });
  };

  $: {
    if (files && files[0]) {
      fileReader.readAsText(files[0]);
    }
  }

  async function analyze(rawMessages: string[]) {
    const messages = rawMessages.map((line) => {
      let time;
      try {
        time = line.match(/\[(.*?)\]/).at(0);
      } catch (error) {
        //console.log(line, error);
      }

      return {
        time,
      };
    });

    return new Set(messages);
  }
</script>

<main>
  <h1>Hello</h1>
  <div>
    {#if files && files[0]}
      <p>
        {files[0].name} ({Math.round(files[0].size / 1024)} kb | {messages.length}
        lines)
      </p>
      <p>
        frist message: {messages[0]}
      </p>
    {:else}
      <input type="file" bind:files accept=".txt" />
    {/if}
  </div>
</main>

<style>
  main {
  }
</style>
