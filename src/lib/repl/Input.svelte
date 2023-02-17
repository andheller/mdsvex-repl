<script>
  import Tabs from "./Tabs.svelte";
  import CodeMirror from "$lib/CodeMirror6.svelte";

  export let components = [];
  export let current = 0;

  let codemirror;

  function get_max(_components) {
    const ids = _components.map(({ id }) => id);
    return Math.max(...ids);
  }

  function new_component() {
    const id = get_max(components) + 1;

    components = components.concat({
      id,
      name: `Component${id}`,
      type: "svelte",
      source: "",
    });

    current = id;
    codemirror.update_editor_source("");
  }

  function update_component_source(new_code) {
    components[current_component].source = new_code;
  }

  $: current_component = components.findIndex(({ id }) => id === current);
  $: tabs = components.map(({ id, name, type }) => ({ id, name, type }));
</script>

<section class="items-stretch flex flex-col h-full overflow-scroll w-full">
  <Tabs
    {tabs}
    {current}
    on:select={({ detail }) => {
      current = detail;
      codemirror.update_editor_source(components[current].source);
    }}
    on:new={new_component}
  />

  <CodeMirror
    {update_component_source}
    bind:text={components[current_component].source}
    bind:this={codemirror}
  />
</section>
