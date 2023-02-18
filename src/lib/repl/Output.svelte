<script>
	export let compiled;

	let iframe;

	function update(code) {
		iframe.contentWindow.postMessage(code, '*');
	}

	$: iframe && compiled && update(compiled);

	const srcdoc = `
<!doctype html>
<html>
	<head>
		<script type="module">

			let c;

			function update(source) {
				const blob = new Blob([source], { type: 'text/javascript' });
				const url = URL.createObjectURL(blob);

				import(url).then(({ default: App }) => {
					if (c) c.$destroy();

					document.body.innerHTML = '';
					c = new App({ target: document.body })
				})
			}

			window.addEventListener('message', event => {
				update(event.data)
			}, false)

		<\/script>
		<\script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio"><\/script>
		

	</head>
	<body class="prose"></body>
</html>
	`;
</script>

<section class="h-full w-full">
	<iframe class="w-full h-full" title="Rendered REPL" bind:this={iframe} {srcdoc} />
</section>
