<script>
	import { onMount } from 'svelte';
	import { animate, timeline, stagger, scroll } from 'chnobli';
	import { from, fromTo, curve, pageOffset } from 'chnobli/utils';
	import {
		cubicOut, cubicInOut, bounceOut, quadInOut, cubicBezier
	} from 'chnobli/easing';
	import { timeout } from 'fire/util.js';
	import Context2d from 'fire/dom/context2d.js';
	import logoSvg from '@/icons/logo.svg?raw';

	let introEl, h1El, dotContEl, dotEl, somethingElseEl;
	let dotIntroTimeline;
	let scrollTimeline;

	function onResize(e) {
		// dotTimeline.update();
	}

	function fadeCharsIn() {
		const chars = h1El.querySelectorAll('svg > *');

		// fade from top
		animate(chars, {
			y: fromTo(-30, 0),
			opacity: 1,
			duration: 300,
			ease: cubicOut,
			delay: stagger(i => 200 + i * 50)
		});
	}

	function jumpingBall() {
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
			y: hOffset.top - dotSize
		};
		const bPos = {
			x: bOffset.left,
			y: bOffset.top - dotSize
		};
		const lPos = {
			x: lOffset.left,
			y: lOffset.top - dotSize
		};
		const iPos = {
			x: iOffset.left,
			y: iOffset.top
		};

		dotIntroTimeline = timeline()
			.set(dotEl, {
				x: hPos.x,
				y: -100
			})
			.add(dotEl, {
				...hPos,
				ease: cubicBezier(.81,.13,.85,.82),
				duration: 450
			}, 500)
			.add(dotEl, {
				xy: curve([
					hPos,
					{
						x: hPos.x + (bPos.x - hPos.x) / 2,
						y: hPos.y - 140,
					},
					bPos
				], 1.2),
				ease: cubicBezier(.15,.24,.87,.65),
				duration: 550
			})
			.add(dotEl, {
				xy: curve([
					bPos,
					{
						x: bPos.x + (lPos.x - bPos.x) / 2,
						y: bPos.y - 80,
					},
					lPos
				], 1.2),
				ease: cubicBezier(.15,.24,.87,.65),
				duration: 500
			})
			.add(dotEl, {
				xy: curve([
					lPos,
					{
						x: lPos.x + (iPos.x - lPos.x) / 2,
						y: lPos.y - 30,
					},
					iPos
				], 1.2),
				ease: cubicBezier(.15,.24,.87,.65),
				width: iOffset.width,
				height: iOffset.height,
				duration: 550
			});

		return {
			x: iPos.x,
			y: iPos.y,
			width: iOffset.width,
			height: iOffset.height
		};
	}

	onMount(async () => {
		if (import.meta.env.DEV)
			await timeout(200);

		dotContEl.style.height = document.body.offsetHeight + 'px';

		fadeCharsIn();
		const dotPos = jumpingBall();

		if (window.scrollY === 0) {
			// run the jumping ball animation
			const onEnd = dotIntroTimeline.onPromise('end');
			dotIntroTimeline.play();
			await onEnd;
		} else {
			dotIntroTimeline.seek(1);
		}


		const center = {
			x: window.innerWidth / 2,
			y: window.innerHeight
		};

		const end = {
			x: window.innerWidth * .5,
			y: window.innerHeight * 1.5
		}

		const minDiameter = Math.max(window.innerWidth, window.innerHeight);

		const diameter = Math.sqrt(
			Math.pow(minDiameter, 2) + Math.pow(minDiameter, 2)
		);

		let dotScrollTimeline = timeline()
			.add(dotEl, {
				xy: curve([
					dotPos,
					{
						x: dotPos.x + window.innerWidth * .05,
						y: dotPos.y + (center.y - dotPos.y) / 2
					},
					// { ...center },
					end
				]),
				duration: 1000
			})
			.add(dotEl, {
				scale: diameter / dotPos.width
			}, 500);


		scrollTimeline = scroll({
			start: introEl,
			end: {
				target: somethingElseEl,
				offset: 'top'
			},
			endView: 'top',
		})
			.add(dotScrollTimeline);
	});
</script>

<svelte:head>
	<title>Chnobli</title>
</svelte:head>

<svelte:window on:resize={onResize} />

<div class="scroll-dot-cont" bind:this={dotContEl}>
	<span class="scroll-dot" bind:this={dotEl}></span>
</div>

<div class="intro" bind:this={introEl}>
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
			<a href="https://github.com/soerenmeier/chnobli" target="_blank">on GitHub</a>
		</div>
	</div>
</div>

<style lang="scss">
	:global {
		body {
			background-color: var(--gray-500)
		}
	}
	.scroll-dot-cont {
		position: absolute;
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
		// overflow-x: hidden;
		// overflow-y: visible;
	}

	.scroll-dot {
		position: absolute;
		display: block;
		top: 0;
		left: 0;
		width: 1.9vmin;
		height: 1.9vmin;
		background-color: var(--accent-500);
		// background-color: red;
		border-radius: 100%;
		transform: translateY(-100px);
	}

	.intro {
		display: flex;
		height: 100vh;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle, #161900 0%, var(--gray-500) 100%);
		text-align: center;
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

			transition: background-color .2s ease, color .2s ease;

			&:hover {
				background-color: var(--accent-500);
				color: var(--gray-500);
			}
		}
	}
</style>