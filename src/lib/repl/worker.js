import * as rollup from 'rollup/dist/es/rollup.browser.js';
import * as mdsvex from 'mdsvex/dist/browser-es';

const CDN_URL = 'https://unpkg.com';
const component_lookup = new Map();

async function fetch_package(url) {
	return (await fetch(url)).text();
}

const fetch_cache = new Map();

async function fetch_if_uncached(url) {
	if (fetch_cache.has(url)) {
		return fetch_cache.get(url);
	}

	const promise = fetch(url)
		.then(async (r) => {
			if (r.ok) {
				return {
					url: r.url,
					body: await r.text()
				};
			}
			throw new Error(await r.text());
		})
		.catch((err) => {
			fetch_cache.delete(url);
			throw err;
		});

	fetch_cache.set(url, promise);
	return promise;
}

async function follow_redirects(url) {
	const res = await fetch_if_uncached(url);
	return res.url;
}

function generate_lookup(components) {
	for (let i = 0; i < components.length; i++) {
		component_lookup.set(`./${components[i].name}.${components[i].type}`, components[i]);
	}
}

self.addEventListener('message', async (event) => {
	try {
		importScripts('https://unpkg.com/svelte@3.49.0/compiler.js');
	} catch {
		await import('https://unpkg.com/svelte@3.49.0/compiler.js');
	}
	generate_lookup(event.data);

	const bundle = await rollup.rollup({
		input: './App.svx',
		plugins: [
			{
				name: 'repl-plugin',
				async resolveId(importee, importer) {
					// handle imports from 'svelte'

					// import x from 'svelte'
					if (importee === 'svelte') return `${CDN_URL}/svelte/index.mjs`;

					// import x from 'svelte/somewhere'
					if (importee.startsWith('svelte/')) {
						return `${CDN_URL}/svelte/${importee.slice(7)}/index.mjs`;
					}

					// import x from './file.js' (via a 'svelte' or 'svelte/x' package)
					if (importer && importer.startsWith(`${CDN_URL}/svelte/` || importer == 'svelte')) {
						const resolved = new URL(importee, importer).href;
						if (resolved.endsWith('.mjs')) return resolved;
						return `${resolved}/index.mjs`;
					}

					// local repl components
					if (component_lookup.has(importee)) return importee;

					// remove trailing slash
					if (importee.endsWith('/')) importee = importee.slice(0, -1);

					// importing from a URL
					if (importee.startsWith('http:') || importee.startsWith('https:')) return importee;

					// relative imports from a remote package... Change to follow
					//   if (importee.startsWith(".")) return new URL(importee, importer).href;
					if (importee.startsWith('.')) {
						const url = new URL(importee, importer).href;
						return await follow_redirects(url);
					}

					// bare named module imports (importing an npm package)

					try {
						const pkg_url = await follow_redirects(`${CDN_URL}/${importee}/package.json`);
						const pkg_json = (await fetch_if_uncached(pkg_url)).body;
						const pkg = JSON.parse(pkg_json);

						if (pkg.svelte || pkg.module || pkg.main) {
							const url = pkg_url.replace(/\/package\.json$/, '');
							return new URL(pkg.svelte || pkg.module || pkg.main, `${url}/`).href;
						}
					} catch (err) {
						// ignore
					}

					return await follow_redirects(`${CDN_URL}/${importee}`);
				},
				async load(id) {
					// local repl components are stored in memory
					// this is our virtual filesystem
					if (component_lookup.has(id)) return component_lookup.get(id).source;

					// everything else comes from a cdn

					const res = await fetch_if_uncached(id);
					return res.body;
				},
				transform(code, id) {
					if (!/\.svelte$|\.svx$/.test(id)) return null;
					let preprocessPromise;

					if (fetch_cache.has(id) && fetch_cache.get(id).code === code) {
						return fetch_cache.get(id).result;
					} else if (/\.svx$/.test(id)) {
						preprocessPromise = mdsvex.mdsvex().markup({ content: code, filename: id });
					} else {
						preprocessPromise = Promise.resolve({ code });
					}

					// const result = cache[id] && cache[id].code === code
					// 	? cache[id].result
					// 	:
					return preprocessPromise.then((code) => {
						//@ts-ignore
						return svelte.compile(code.code).js.code;
						// if (/.*\.svelte/.test(id)) return svelte.compile(code.code).js.code;
					});
					// if (/.*\.svelte/.test(id)) return svelte.compile(code).js.code;
				}
			}
		]
	});

	// a touch longwinded but output contains an array of chunks
	// we are not code-splitting, so we only have a single chunk
	const output = (await bundle.generate({ format: 'esm' })).output[0].code;
	self.postMessage(output);
});
