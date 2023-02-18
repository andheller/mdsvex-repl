<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import * as Y from 'yjs';
	import { IndexeddbPersistence } from 'y-indexeddb';
	import { ymap } from '$lib/stores';

	import Repl from '$lib/repl/yrepl.svelte';

	let ydoc, map, indexeddb;
	const id = 'y';
	let loaded = false;
	let json;

	function new_repl() {
		const repl = new Y.Array();
		const file = new Y.Map();
		const source = new Y.Text();
		file.set('id', 1);
		file.set('name', 'App');
		file.set('type', 'svx');
		file.set('source', source);
		repl.insert(0, [file]);

		return repl;
	}

	onMount(async () => {
		ydoc = new Y.Doc();
		$ymap = ydoc.getMap('map');

		if (!browser) return;
		indexeddb = new IndexeddbPersistence(id, ydoc);
		indexeddb.on('synced', () => {
			map = $ymap.toJSON();
			if (!map[id]) $ymap.set(id, new_repl());
			loaded = true;
		});
		// loaded = true;
	});
</script>

<div class="min-h-screen">
	{#if loaded}<Repl yid={id} />{/if}
</div>
