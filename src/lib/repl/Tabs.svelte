<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let tabs = [];
  export let current = 0;
</script>

<ul
  class="flex space-x-1 p-1 bg-slate-100 overflow-scroll sticky z-50 top-0 min-h-[50px]"
>
  {#each tabs as { name, type, id }}
    <li
      class:active={id === current}
      class="cursor-pointer p-2"
      on:click={() => dispatch("select", id)}
    >
      {name}.{type}
    </li>
  {/each}
  <li class="p-2"><button on:click={() => dispatch("new")}>+</button></li>
</ul>

<style>
	.active {
		text-decoration: underline;
		cursor: text;
	}
</style>
