<script>
  import moment from "moment";
  import { onMount } from "svelte";

  const apiHost = import.meta.env.VITE_API_HOST || "127.0.0.1";

  /**
   * @type {HTMLButtonElement}
   */
  let initializeButton;

  /**
   * @type {HTMLButtonElement}
   */
  let prevButton;

  /**
   * @type {HTMLButtonElement}
   */
  let dangerButton;

  /**
   * @type {HTMLButtonElement}
   */
  let nextButton;

  /**
   * @type {HTMLUListElement}
   */
  let statesContainer;
  let currentState = "";

  /**
   * @type {HTMLButtonElement}
   */
  let endButton;

  /**
   * @type {HTMLSpanElement}
   */
  let stopwatch;

  /**
   * @type {HTMLButtonElement}
   */
  let stopwatchButton;

  /**
   * @type {number | undefined}
   */
  let clock = undefined;
  let paused = true;
  let counter = 0;

  /**
   * @type {{ name: string }[]}
   */
  let states = [];

  const displayTime = () =>
    (stopwatch.innerHTML = moment()
      .hour(0)
      .minute(0)
      .second((counter += 1))
      .format("HH : mm : ss"));

  const startStopwatch = () => {
    clock = window.setInterval(displayTime, 1000);
    paused = false;
  };

  const stopStopwatch = () => {
    window.clearInterval(clock);
    paused = true;
  };

  const resetStopwatch = () => {
    stopStopwatch();
    counter = 0;
  };

  $: stopwatchHandler = paused ? startStopwatch : stopStopwatch;
  $: stopwatchText = paused ? "Resume" : "Pause";

  async function initialize() {
    initializeButton.disabled = true;
    try {
      const res = await fetch(`http://${apiHost}:3000/initialize`, {
        method: "POST",
      });

      const state = await res.json();
      currentState = state.name;

      prevButton.disabled = false;
      dangerButton.disabled = false;
      nextButton.disabled = false;
      endButton.disabled = false;

      stopwatchButton.disabled = false;
      stopwatch.innerHTML = moment()
        .hour(0)
        .minute(0)
        .second(0)
        .format("HH : mm : ss");

      startStopwatch();
    } catch (err) {
      console.error("error", err);
      initializeButton.disabled = false;
    }
  }

  async function prev() {
    prevButton.disabled = true;

    try {
      const res = await fetch(`http://${apiHost}:3000/prev`, {
        method: "POST",
      });
      const state = await res.json();
      currentState = state.name;
    } catch (err) {
      console.error("error", err);
    } finally {
      prevButton.disabled = false;
    }
  }

  async function next() {
    nextButton.disabled = true;

    try {
      const res = await fetch(`http://${apiHost}:3000/next`, {
        method: "POST",
      });
      const state = await res.json();
      currentState = state.name;
    } catch (err) {
      console.error("error", err);
    } finally {
      nextButton.disabled = false;
    }
  }

  async function danger() {
    dangerButton.disabled = true;

    try {
      await fetch(`http://${apiHost}:3000/danger`, { method: "POST" });
    } catch (err) {
      console.error("error", err);
    } finally {
      dangerButton.disabled = false;
    }
  }

  async function end() {
    endButton.disabled = true;

    try {
      await fetch(`http://${apiHost}:3000/end`, { method: "POST" });
      prevButton.disabled = true;
      dangerButton.disabled = true;
      nextButton.disabled = true;

      stopwatchButton.disabled = true;
      stopwatch.innerHTML = moment()
        .hour(0)
        .minute(0)
        .second(0)
        .format("HH : mm : ss");

      initializeButton.disabled = false;

      resetStopwatch();
    } catch (err) {
      console.error("error", err);
      endButton.disabled = false;
    }
  }

  onMount(async () => {
    const res = await fetch(`http://${apiHost}:3000/states`);
    states = await res.json();
  });
</script>

<div id="buttons" class="flex flex-col w-full p-2">
  <button
    class="p-2 bg-green-700 text-white my-2 hover:bg-green-900 disabled:bg-gray-700 disabled:cursor-not-allowed"
    on:click={initialize}
    bind:this={initializeButton}
  >
    Initialize
  </button>
  <div class="flex flex-row justify-around">
    <button
      disabled
      class="w-32 p-2 bg-yellow-700 text-white my-2 hover:bg-yellow-900 disabled:bg-gray-700 disabled:cursor-not-allowed"
      on:click={prev}
      bind:this={prevButton}
    >
      Previous
    </button>
    <button
      disabled
      class="w-32 p-2 bg-red-700 text-white my-2 hover:bg-red-900 disabled:bg-gray-700 disabled:cursor-not-allowed"
      on:click={danger}
      bind:this={dangerButton}
    >
      Danger
    </button>
    <button
      disabled
      class="w-32 p-2  bg-green-700 text-white my-2 hover:bg-green-900 disabled:bg-gray-700 disabled:cursor-not-allowed"
      on:click={next}
      bind:this={nextButton}
    >
      Next
    </button>
  </div>
  <div class="flex flex-col justify-center">
    Current State:
    <ul class="flex flex-row justify-around" bind:this={statesContainer}>
      {#each states as state}
        <li
          class={[
            "p-1",
            currentState === state.name ? "border border-black" : "border-0",
          ].join(" ")}
        >
          {state.name}
        </li>
      {/each}
    </ul>
  </div>
  <div class="flex flex-row justify-center">
    Run Time:&nbsp;
    <span bind:this={stopwatch}>not initialized</span>
  </div>
  <div class="flex flex-row justify-center">
    <button
      disabled
      class="w-20 p-1.5 bg-cyan-700 text-white my-2 hover:bg-cyan-900 disabled:bg-gray-700 disabled:cursor-not-allowed"
      on:click={() => stopwatchHandler()}
      bind:this={stopwatchButton}
    >
      {stopwatchText}
    </button>
  </div>
  <button
    disabled
    class="p-2 bg-green-700 text-white my-2 hover:bg-green-900 disabled:bg-gray-700 disabled:cursor-not-allowed"
    bind:this={endButton}
    on:click={end}
  >
    End
  </button>
</div>
