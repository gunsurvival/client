import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import World from './world/World';
import type IEntity from './entity/Entity';
import type Entity from '../../../core/src/entity/Entity';
import {type IPlayer} from '../../../core/src/entity/Player';
import {lerp} from '../../../core/src/util/common';
import Bush from './entity/Bush';
import Rock from './entity/Rock';

export default class Game {
	deltaMs: number;
	player: Entity & IEntity & IPlayer;
	elapsedMs = 0;
	accumulator = 0;
	app = new PIXI.Application({width: 1366, height: 768, backgroundColor: '#133a2b'});
	viewport = new Viewport({
		screenWidth: this.app.screen.width,
		screenHeight: this.app.screen.height,

	});

	world = new World(this.viewport);
	pointerPos = {
		x: 0,
		y: 0,
	};

	constructor(public tps = 60) {
		this.deltaMs = 1000 / this.tps;
	}

	init() {
		const bush = new Bush();
		const rock = new Rock();
		this.app.stage.addChild(this.viewport);
		this.world.add(this.player);
		this.world.add(bush);
		this.world.add(rock);

		this.app.ticker.add(() => {
			this.accumulator += this.app.ticker.deltaMS;
			while (this.accumulator >= this.deltaMs) {
				this.accumulator -= this.deltaMs;
				this.world.nextTick({
					accumulator: this.accumulator,
					elapsedMs: this.elapsedMs,
					deltaMs: this.deltaMs,
					delta: 1,
				});
				this.elapsedMs += this.deltaMs;
			}

			const camX = -this.player.displayObject.position.x + (this.viewport.screenWidth / 2);
			const camY = -this.player.displayObject.position.y + (this.viewport.screenHeight / 2);
			this.viewport.position.set(lerp(this.viewport.position.x, camX, 0.01), lerp(this.viewport.position.y, camY, 0.01));

			const playerScreenPos = this.viewport.toScreen(this.player.body.x, this.player.body.y);
			this.player.body.setAngle(Math.atan2(
				this.pointerPos.y - playerScreenPos.y,
				this.pointerPos.x - playerScreenPos.x,
			));
		});

		this.app.stage.interactive = true;
		this.app.stage.hitArea = this.app.screen;

		this.app.stage.addEventListener('pointermove', (event: Event) => {
			const {global} = event as PIXI.FederatedMouseEvent;
			this.pointerPos.x = global.x;
			this.pointerPos.y = global.y;
		});

		document.addEventListener('keydown', key => {
			switch (key.code) {
				case 'KeyW':
					this.player.state.keyboard.w = true;
					break;
				case 'KeyA':
					this.player.state.keyboard.a = true;
					break;
				case 'KeyS':
					this.player.state.keyboard.s = true;
					break;
				case 'KeyD':
					this.player.state.keyboard.d = true;
					break;
				default:
					break;
			}
		});

		document.addEventListener('keyup', key => {
			switch (key.code) {
				case 'KeyW':
					this.player.state.keyboard.w = false;
					break;
				case 'KeyA':
					this.player.state.keyboard.a = false;
					break;
				case 'KeyS':
					this.player.state.keyboard.s = false;
					break;
				case 'KeyD':
					this.player.state.keyboard.d = false;
					break;
				default:
					break;
			}
		});
	}
}
