import Route from 'fire-svelte/routing/Route';
import Request from 'fire-svelte/routing/Request';
import * as routes from './routes/routes.js';
import { RoutingHandler } from 'fire-svelte/routing/Router';

// should return { status, props }
export async function handleRoute(
	req: Request,
	route: Route | null,
): Promise<{ status: number; props: any }> {
	if (!route) {
		return {
			status: 404,
			props: {
				component: routes.NotFound,
				props: {},
			},
		};
	}

	let comp, pageProps;
	try {
		comp = await route.load(req);

		if (typeof comp.loadProps === 'function')
			pageProps = await comp.loadProps(route.toProps(req));
		else pageProps = {};
	} catch (e) {
		console.log('error', e);
		return {
			status: 500,
			props: {
				component: routes.NotFound,
				props: {},
			},
		};
	}

	return {
		status: 200,
		props: {
			component: comp.default,
			props: pageProps,
		},
	};
}
