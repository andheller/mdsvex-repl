<script>
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import * as Y from 'yjs';
	import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
	// import { WebrtcProvider } from 'y-webrtc';
	import { EditorView, basicSetup } from 'codemirror';
	import { keymap } from '@codemirror/view';
	import { javascript } from '@codemirror/lang-javascript';
	import { html } from '@codemirror/lang-html';
	import { EditorState } from '@codemirror/state';
	let editor, view, ydoc, state, provider, ytext, cm;
	export let update_component_source;
	export let text = '';
	export const userColor = { color: '#30bced', light: '#30bced33' };
	// export const userColor = usercolors[random.uint32() % usercolors.length];
	onMount(() => {
		if (provider) provider.destroy();
		create_codemirror(text);
	});
	onDestroy(() => {
		if (view) view.destroy();
		if (provider) provider.destroy();
	});
	function create_codemirror(text) {
		if (!browser) return;
		if (view) view.destroy();
		if (provider) provider.destroy();
		if (ydoc) ydoc.destroy();
		if (editor) {
			ydoc = new Y.Doc();
			ytext = ydoc.getText('codemirror');
			state = EditorState.create({
				doc: text,
				extensions: [
					keymap.of([...yUndoManagerKeymap]),
					basicSetup,
					html(),
					EditorView.lineWrapping,
					EditorView.updateListener.of((e) => {
						if (e.docChanged) {
							update_component_source(e.state.doc.toString());
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
	export function update_editor_source(new_source) {
		view.setState(
			EditorState.create({
				doc: new_source,
				extensions: [
					keymap.of([...yUndoManagerKeymap]),
					basicSetup,
					html(),
					EditorView.lineWrapping,
					EditorView.updateListener.of((e) => {
						if (e.docChanged) {
							update_component_source(e.state.doc.toString());
						}
					})
				]
			})
		);
	}
</script>

<div bind:this={editor} class="text-base sm:text-sm h-full" />

<style>
	:global(.cm-editor) {
		height: 100%;
	}
</style>
