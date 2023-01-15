import * as PIXI from 'pixi.js';
import World from '../../../core/src/world/World';

function lerp(start: number, end: number, amt: number) {
	return ((1 - amt) * start) + (amt * end);
}

export default function createPixiApp(fps = 5) {
	const app = new PIXI.Application({width: 640, height: 360});
	const world = new World();
	const sprite = PIXI.Sprite.from('amogus.png');
	app.stage.addChild(sprite);

	const deltaTime = 1000 / fps;
	let accumulator = 0;
	let tick = 0;
	app.ticker.add(delta => {
		accumulator += app.ticker.deltaMS;
		while (accumulator >= deltaTime) {
			world.nextTick(tick, deltaTime);
			accumulator -= deltaTime;
			tick += deltaTime;
		}
	});
	return app;
}
