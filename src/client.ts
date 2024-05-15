import App from './App.svelte';
import Router from 'fire-svelte/routing/Router';
import SsrCache from 'fire-svelte/ssr/SsrCache';
import * as routes from './routes/routes.js';
import { handleRoute } from './main.js';

async function main() {
	const cache = new SsrCache();
	const router = new Router();

	const context = new Map();
	context.set('router', router);

	routes.register(router);

	let app: App;

	router.onRequest(async (req, routing) => {
		const route = router.route(req);

		const { props } = await handleRoute(req, route);
		if (await routing.dataReady()) return;

		if (!app) {
			app = new App({
				target: document.body,
				props,
				hydrate: true,
				context,
			});
		} else {
			app.$set(props);
		}

		routing.domReady();
	});

	router.initClient();
}
main();
