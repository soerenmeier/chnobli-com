import { resolve, relative } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { usedSsrComponents } from 'fire-svelte/ssr/SsrComponents';
import sveltePreprocess from 'svelte-preprocess';

// https://vitejs.dev/config/
export default defineConfig(({ outDir, mode, ssrBuild }) => {
	return {
		plugins: [
			svelte({
				preprocess: sveltePreprocess(),
				compilerOptions: {
					hydratable: true,
				},
			}),
			usedSsrComponents(f => relative(__dirname, f)),
		],
		resolve: {
			alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
		},
	};
});
