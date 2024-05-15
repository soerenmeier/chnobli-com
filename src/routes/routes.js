import NotFound from './Error-404.svelte';

export function register(router) {
	router.register('/', () => import('./index/Index.svelte'));
}

export { NotFound };
