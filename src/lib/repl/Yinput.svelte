<script>
	import * as Y from 'yjs';
	import Tabs from './Tabs.svelte';
	import CodeMirror from '$lib/repl/CodeMirror.svelte';

	export let components = [];
	export let current = 1;
	export let tabs = true;
	export let yid;
	export let yrepl;

	let codemirror, current_component;

	function get_max(_components) {
		const ids = _components.map(({ id }) => id);
		return Math.max(...ids);
	}

	function new_component() {
		const id = get_max(components) + 1;

		// components = components.concat({
		//   id,
		//   name: `Component${id}`,
		//   type: "svelte",
		//   source: "",
		// });

		const file = new Y.Map();
		const source = new Y.Text();
		file.set('id', id);
		file.set('name', `Component${id}`);
		file.set('type', 'svelte');
		file.set('source', source);

		yrepl.insert(yrepl.length, [file]);
	}

	function remove_component(event) {
		const uid = event.detail;
		const index = components.findIndex(({ id }) => id === uid);

		yrepl.delete(index, 1);
	}

	// use uuid for id in case of collision.

	$: tabs = components.map(({ id, name, type }) => ({ id, name, type }));
</script>

<section class="items-stretch flex flex-col h-full overflow-scroll w-full">
	<Tabs
		{tabs}
		{current}
		on:select={({ detail }) => {
			current = detail;
			const current_component = components.findIndex(({ id }) => id === current);
			codemirror.update_editor_source(current_component);
		}}
		on:new={new_component}
		on:remove={remove_component}
	/>

	<CodeMirror bind:this={codemirror} bind:current_component {yid} />
</section>
