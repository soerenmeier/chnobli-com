<script>
	import { onMount } from 'svelte';
	import { animate, timeline, stagger } from 'chnobli';
	import { scroll } from 'chnobli/scroll';
	import { from, fromTo, curve, pageOffset, responsive } from 'chnobli/utils';
	import {
		cubicOut,
		cubicInOut,
		bounceOut,
		quadInOut,
		cubicBezier,
	} from 'chnobli/easing';
	import { timeout } from 'fire/utils';
	import logoSvg from '@/icons/logo.svg?raw';

	let introEl, h1El, dotEl, somethingElseEl;
	let dotIntroTimeline;
	let scrollTimeline;
	let dotScrollTimeline;

	async function fadeInBg() {
		const bg = introEl.querySelector('.intro-bg');

		const ani = animate(bg, {
			opacity: 1,
			ease: cubicInOut,
			duration: 400,
		});

		return ani.onPromise('end');
	}

	function fadeCharsIn() {
		const chars = h1El.querySelectorAll('svg > *');

		// fade from top
		animate(chars, {
			y: fromTo(-30, 0),
			opacity: 1,
			duration: 300,
			ease: cubicOut,
			delay: stagger(i => 200 + i * 50),
		});
	}

	function jumpingBall() {
		/*
		since this is a oneshot animation we ignore resizes
		*/
		const svg = h1El.querySelector('svg');

		// jumping ball
		const hChar = svg.querySelector('.h');
		const bChar = svg.querySelector('.b');
		const lChar = svg.querySelector('.l');
		const iDot = svg.querySelector('.i-dot');

		const dotSize = dotEl.offsetWidth;

		const hOffset = pageOffset(hChar);
		const bOffset = pageOffset(bChar);
		const lOffset = pageOffset(lChar);
		const iOffset = pageOffset(iDot);

		const hPos = {
			x: hOffset.left,
			y: hOffset.top - dotSize,
		};
		const bPos = {
			x: bOffset.left,
			y: bOffset.top - dotSize,
		};
		const lPos = {
			x: lOffset.left,
			y: lOffset.top - dotSize,
		};
		const iPos = {
			x: iOffset.left,
			y: iOffset.top,
		};

		dotIntroTimeline = timeline({ responsive: false })
			.set(dotEl, {
				x: hPos.x,
				y: -100,
			})
			.add(
				dotEl,
				{
					...hPos,
					ease: cubicBezier(0.81, 0.13, 0.85, 0.82),
					duration: 450,
				},
				500,
			)
			.add(dotEl, {
				xy: curve(
					[
						hPos,
						{
							x: hPos.x + (bPos.x - hPos.x) / 2,
							y: hPos.y - 140,
						},
						bPos,
					],
					1.2,
				),
				ease: cubicBezier(0, 0.2, 1, 0.8),
				duration: 550,
			})
			.add(dotEl, {
				xy: curve(
					[
						bPos,
						{
							x: bPos.x + (lPos.x - bPos.x) / 2,
							y: bPos.y - 80,
						},
						lPos,
					],
					1.2,
				),
				ease: cubicBezier(0, 0.2, 1, 0.8),
				duration: 500,
			})
			.add(dotEl, {
				xy: curve(
					[
						lPos,
						{
							x: lPos.x + (iPos.x - lPos.x) / 2,
							y: lPos.y - 30,
						},
						iPos,
					],
					1.2,
				),
				ease: cubicBezier(0, 0.2, 1, 0.8),
				width: iOffset.width,
				height: iOffset.height,
				duration: 550,
			});

		return {
			x: iPos.x,
			y: iPos.y,
			width: iOffset.width,
			height: iOffset.height,
		};
	}

	onMount(async () => {
		if (import.meta.env.DEV) await timeout(200);

		await fadeInBg();
		fadeCharsIn();
		jumpingBall();

		if (window.scrollY === 0) {
			// run the jumping ball animation
			const onEnd = dotIntroTimeline.onPromise('end');
			dotIntroTimeline.play();
			await onEnd;
		} else {
			dotIntroTimeline.seek(1);
		}

		console.log('ani done');

		let dotPos, center, end, minDiameter, diameter;
		const resp1 = responsive(() => {
			const svg = h1El.querySelector('svg');
			const iDot = svg.querySelector('.i-dot');
			console.log('iDot', iDot);
			const iOffset = pageOffset(iDot);
			console.log('iOffset', iOffset);

			dotPos = {
				x: iOffset.left,
				y: iOffset.top,
				width: iOffset.width,
				height: iOffset.height,
			};

			center = {
				x: window.innerWidth / 2,
				y: window.innerHeight,
			};

			end = {
				x: window.innerWidth * 0.5,
				y: window.innerHeight * 1.5,
			};

			minDiameter = Math.max(window.innerWidth, window.innerHeight);

			diameter = Math.sqrt(
				Math.pow(minDiameter, 2) + Math.pow(minDiameter, 2),
			);
		});

		dotScrollTimeline = timeline()
			.set(dotEl, {
				width: responsive(() => dotPos.width),
				height: responsive(() => dotPos.height),
			})
			.add(
				dotEl,
				{
					xy: responsive(() =>
						curve([
							dotPos,
							{
								x: dotPos.x + window.innerWidth * 0.05,
								y: dotPos.y + (center.y - dotPos.y) / 2,
							},
							// { ...center },
							end,
						]),
					),
					duration: 1000,
				},
				0,
			)
			.add(
				dotEl,
				{
					scale: responsive(() => diameter / dotPos.width),
				},
				500,
			)
			.addResponsive(resp1);
		dotScrollTimeline.seek(0);

		// dotScrollTimeline.on('start', () => console.log('dot start'));
		// dotScrollTimeline.on('end', () => console.log('dot end'));

		// scrollTimeline = scroll({
		// 	start: introEl,
		// 	end: {
		// 		target: somethingElseEl,
		// 		offset: 'top',
		// 		view: 'top',
		// 	},
		// }).add(dotScrollTimeline);

		scrollTimeline = scroll()
			.add(introEl)
			.add({
				target: somethingElseEl,
				offset: 'top',
				view: 'top',
			})
			.addTimeline(dotScrollTimeline);
	});
</script>

<svelte:head>
	<title>Chnobli</title>
</svelte:head>

<!-- <svelte:window on:resize={onResize} /> -->

<div class="scroll-dot-cont">
	<span class="scroll-dot" bind:this={dotEl}></span>
</div>

<div class="intro" bind:this={introEl}>
	<div class="intro-bg"></div>
	<div class="center">
		<h1 bind:this={h1El}>
			<span>Chnobli</span>
			{@html logoSvg}
		</h1>
		<p>Give your website some spice</p>
	</div>
</div>

<div class="something-else" bind:this={somethingElseEl}>
	<div class="center">
		<h1>Get Started</h1>
		<div class="btns">
			<a href="/demos">Demos</a>
			<a href="https://github.com/soerenmeier/chnobli" target="_blank"
				>on GitHub</a
			>
		</div>
	</div>
</div>
<div class="something-else"></div>

<style lang="scss">
	:global {
		body {
			background-color: var(--gray-500);
		}
	}
	.scroll-dot-cont {
		position: absolute;
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
		// z-index: 2;
	}

	.scroll-dot {
		position: absolute;
		display: block;
		top: 0;
		left: 0;
		width: 1.9vmin;
		height: 1.9vmin;
		background-color: var(--accent-500);
		border-radius: 100%;
		transform: translateY(-100px);
	}

	.intro {
		position: relative;
		display: flex;
		height: 100vh;
		align-items: center;
		justify-content: center;
		// background: radial-gradient(circle, #161900 0%, var(--gray-500) 100%);
		text-align: center;
	}

	.intro-bg {
		position: absolute;
		display: block;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: radial-gradient(circle, #161900 0%, var(--gray-500) 100%);
		opacity: 0;
		z-index: -1;
	}

	h1 {
		position: relative;
		font-size: 12vmin;
		font-weight: 700;

		span {
			position: absolute;
			display: block;
			color: transparent;
			text-align: center;
			width: 100%;

			&::selection {
				color: var(--gray-500);
				background-color: var(--accent-500);
			}
		}

		:global {
			svg {
				width: 46vmin;
				overflow: visible;

				> * {
					opacity: 0;
				}

				.i-dot {
					opacity: 0;
				}

				path {
					fill: var(--accent-500);
				}
			}
		}
	}

	.intro p {
		color: #fff;
		font-size: 1.2rem;
	}

	.something-else {
		position: relative;
		display: flex;
		height: 100vh;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: var(--gray-500);

		.btns {
			margin-top: 2rem;
			text-align: center;
		}

		a {
			display: inline;
			text-decoration: none;
			font-size: 1.3rem;
			font-weight: bold;
			background-color: var(--gray-500);
			color: var(--accent-500);
			padding: 0.5rem 1rem;
			border-radius: 4px;
			border: 3px solid var(--gray-500);

			transition:
				background-color 0.2s ease,
				color 0.2s ease;

			&:hover {
				background-color: var(--accent-500);
				color: var(--gray-500);
			}
		}
	}
</style>
