<script>
  function initialize() {
    fetch("http://127.0.0.1:3000/initialize", { method: "POST" });
  }

  function start() {
    fetch("http://127.0.0.1:3000/start", { method: "POST" });
  }

  function next() {
    fetch("http://127.0.0.1:3000/next", { method: "POST" });
  }

  function stop() {
    fetch("http://127.0.0.1:3000/stop", { method: "POST" });
  }

  function end() {
    fetch("http://127.0.0.1:3000/end", { method: "POST" });
  }
</script>

<button on:click={initialize}> Initialize </button>
<button on:click={start}> Start </button>
<button on:click={next}> Next </button>
<button on:click={stop}> Stop </button>
<button on:click={end}> End </button>
