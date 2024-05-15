import App from './App.svelte';
import Router from 'fire-svelte/routing/Router';
import Request from 'fire-svelte/routing/Request';
import SsrCache from 'fire-svelte/ssr/SsrCache';
import SsrComponents from 'fire-svelte/ssr/SsrComponents';
import * as routes from './routes/routes.js';
import { handleRoute } from './main.js';

// opt: { method, uri, ?ssrManifest }
// returns: { status, body, head }
export async function render(opt: any) {
	const cache = new SsrCache();
	const router = new Router();

	routes.register(router);

	console.log('opt', opt);

	const req = new Request(opt.url);

	const route = router.route(req);
	const { status, props } = await handleRoute(req, route);

	const ssrComponents = new SsrComponents();
	const context = new Map();
	context.set('router', router);
	ssrComponents.addToContext(context);

	let { html, head } = App.render(props, { context });

	head += ssrComponents.toHead(opt?.ssrManifest ?? {});
	head += cache.toHead();

	return {
		status,
		fields: {
			head,
			body: html,
		},
	};
}

export { routes };
