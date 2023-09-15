<script>
	import './app.scss';

	// page
	export let page;
</script>

{#key page}
	<svelte:component this={page.component} {...page.props} />
{/key}