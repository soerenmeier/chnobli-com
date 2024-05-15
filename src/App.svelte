<script>
	import './app.scss';

	// page
	export let component;
	export let props;
</script>

<!-- {#key props} -->
<svelte:component this={component} {...props} />
<!-- {/key} -->
