<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Input from './Yinput.svelte';
	import Output from './Output.svelte';
	import { ymap } from '$lib/stores';

	export let yid;

	// export let embed = false;
	let input_w = 50;
	let output_w = 50;
	let resize = false;
	let resize_bar;
	let current = 1;
	let worker, compiled;
	let input_output_toggle = true;
	let innerWidth, yrepl;
	let components = [];
	let loaded = false;

	$: if (innerWidth < 640) {
		if (input_w * output_w != 0) {
			input_output_toggle = true;
			input_w = 100;
			output_w = 0;
		}
	}

	$: if (innerWidth > 640) {
		if (input_w * output_w == 0) {
			input_w = 50;
			output_w = 50;
		}
	}

	onMount(async () => {
		if (!browser) return;
		yrepl = $ymap.get(yid);
		console.log('yrepl', yrepl.toJSON());
		components = yrepl.toJSON();
		yrepl.observeDeep(() => {
			components = yrepl.toJSON();
		});

		worker = new Worker(new URL('./worker.js', import.meta.url), {
			type: 'module'
		});

		worker.addEventListener('message', (event) => {
			compiled = event.data;
		});

		loaded = true;
	});

	function compile(_components) {
		if (worker) worker.postMessage(_components);
	}
	function handle_pointerdown(e) {
		resize = true;
		resize_bar.setPointerCapture(e.pointerId);

		resize_bar.addEventListener('pointermove', (e) => {
			if (!resize) return;
			input_w = (e.clientX / window.innerWidth) * 100;
			output_w = 100 - input_w;
		});
		resize_bar.addEventListener(
			'pointerup',
			() => {
				resize = false;
				resize_bar.releasePointerCapture(e.pointerId);
			},
			{ once: true }
		);
	}

	$: compile(components);
</script>

<svelte:head>
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
	/>
</svelte:head>
<svelte:window bind:innerWidth />

{#if loaded}
	<div class="max-h-full h-screen w-full relative">
		<div class="h-full">
			<div class="h-full overflow-scroll">
				<div class="inline-flex w-full h-full">
					<div style="width:{input_w}%;" class="h-full overflow-scroll pb-[40px]  sm:pb-0">
						<Input bind:components bind:current {yid} {yrepl} />
					</div>
					<div
						bind:this={resize_bar}
						on:pointerdown={handle_pointerdown}
						class="bg-slate-50 h-full w-1 cursor-col-resize absolute hidden sm:block"
						style="left:{input_w}%; margin-left:-3px;"
					/>
					<div style="width:{output_w}%">
						<Output {compiled} />
					</div>
				</div>
			</div>
			<div class="border-t backdrop-blur-sm bottom-0 absolute w-full sm:hidden p-2">
				<div class="m-auto flex max-w-xs">
					Input
					<button
						on:doubleclick|preventDefault
						on:click|preventDefault={() => {
							input_output_toggle = !input_output_toggle;
							input_w = input_output_toggle * 100;
							output_w = !input_output_toggle * 100;
						}}
						type="button"
						class="{input_output_toggle ? 'bg-gray-200' : 'bg-blue-400'} 
          m-auto relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						role="switch"
						aria-checked="false"
					>
						<span class="sr-only">Use setting</span>
						<!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
						<span
							aria-hidden="true"
							class="{input_output_toggle
								? 'translate-x-0'
								: 'translate-x-5'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
						/>
					</button>
					Output
				</div>
			</div>
		</div>
	</div>
{:else}
	loading...
{/if}
