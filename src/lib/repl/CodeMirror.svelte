<script>
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	// import * as Y from "yjs";
	import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
	import { ymap } from '$lib/stores';

	import { EditorView, basicSetup } from 'codemirror';
	import { keymap } from '@codemirror/view';
	import { javascript } from '@codemirror/lang-javascript';
	import { html } from '@codemirror/lang-html';
	import { EditorState } from '@codemirror/state';

	let editor, view, state;
	export let yid;
	let components;

	export const userColor = { color: '#30bced', light: '#30bced33' };

	// export const userColor = usercolors[random.uint32() % usercolors.length];

	onMount(() => {
		components = $ymap.get(yid);

		create_codemirror();
	});
	onDestroy(() => {
		// if (view) view.destroy();
	});
	function create_codemirror() {
		if (!browser) return;
		if (view) view.destroy();

		if (editor) {
			const file = components.get(0);
			const source = file.get('source');

			state = EditorState.create({
				doc: source.toString(),
				extensions: [
					keymap.of([...yUndoManagerKeymap]),
					basicSetup,
					html(),
					yCollab(source),
					EditorView.lineWrapping,
					EditorView.baseTheme({
						'.cm-gutters': {
							color: '#334155',
							background: '#f1f5f9'
						}
					})
				]
			});

			view = new EditorView({
				state,
				parent: editor
			});
		}
	}

	export function update_editor_source(current) {
		const file = components.get(current);
		const source = file.get('source');

		view.setState(
			EditorState.create({
				doc: source.toString(),
				extensions: [
					keymap.of([...yUndoManagerKeymap]),
					basicSetup,
					html(),
					yCollab(source),
					EditorView.lineWrapping
				]
			})
		);
	}
</script>

<div bind:this={editor} class="text-base sm:text-sm flex-1 overflow-scroll" />

<style>
	:global(.cm-editor) {
		height: 100%;
	}
</style>
