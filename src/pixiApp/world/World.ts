import {type Viewport} from 'pixi-viewport';
import type {Entity as EntityCore} from '@gunsurvival/core/entity';
import type Entity from '../entity/Entity.js';
import type WorldCore from '@gunsurvival/core/world';

export default class World {
	app = new PIXI.Application({width: 1366, height: 768, backgroundColor: '#133a2b'});
	viewport = new Viewport({
		screenWidth: this.app.screen.width,
		screenHeight: this.app.screen.height,
	});

	world: WorldCore; // Reference to the room state if online or create new World if offline

	constructor(public viewport: Viewport) {
		this.app.stage.addChild(this.viewport);
		this.app.ticker.add(() => {

		});
	}

	nextTick() {
		this.accumulator += this.app.ticker.deltaMS;
		while (this.accumulator >= this.targetDelta) {
			this.accumulator -= this.targetDelta;
			const tickData = {
				accumulator: this.accumulator,
				elapsedMs: this.elapsedMs,
				deltaMs: this.targetDelta,
				delta: 1,
			};

			this.player.update(this.world, tickData);
			this.world.nextTick(tickData);
			this.elapsedMs += this.targetDelta;
		}

		const camX = -this.followPos.x + (this.viewport.screenWidth / 2);
		const camY = -this.followPos.y + (this.viewport.screenHeight / 2);
		this.viewport.position.set(lerp(this.viewport.position.x, camX, 0.05), lerp(this.viewport.position.y, camY, 0.05));

		const playerX = this.player.entity.body.pos.x;
		const playerY = this.player.entity.body.pos.y;
		const playerScreenPos = this.viewport.toScreen(playerX, playerY);
		this.player.entity.body.angle = lerpAngle(this.player.entity.body.angle, Math.atan2(
			this.pointerPos.y - playerScreenPos.y,
			this.pointerPos.x - playerScreenPos.x,
		), 0.3);
	}

	add(entity: EntityCore & IEntity) {
		super.add(entity);
		this.viewport.addChild(entity.displayObject);
	}

	remove(entity: EntityCore & IEntity) {
		super.remove(entity);
		this.viewport.removeChild(entity.displayObject);
	}
}
