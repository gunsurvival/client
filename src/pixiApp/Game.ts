import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import World from './world/World';
import type IEntity from './entity/Entity';
import type Entity from '../../../core/src/entity/Entity';
import {type IPlayer} from '../../../core/src/entity/Player';
import Bush from './entity/Bush';
import Rock from './entity/Rock';

function lerp(start: number, end: number, amt: number) {
	return ((1 - amt) * start) + (amt * end);
}

export default class Game {
	deltaMs: number;
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	player: Entity & IEntity & IPlayer;

	elapsedMs = 0;
	accumulator = 0;
	app = new PIXI.Application({width: 1366, height: 768, backgroundColor: '#133a2b'});
	viewport = new Viewport({
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
		worldWidth: 1000,
		worldHeight: 1000,

	});

	world = new World(this.viewport);
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
		this.viewport
			.drag()
			.pinch()
			.wheel()
			.decelerate();

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
		});

		this.app.stage.interactive = true;
		this.app.stage.hitArea = this.app.screen;

		this.app.stage.addEventListener('pointermove', (event: Event) => {
			const {global} = event as PIXI.FederatedMouseEvent;
			this.player.pointer.x = global.x;
			this.player.pointer.y = global.y;
		// Alert(1);
		});

		document.addEventListener('keydown', key => {
			console.log(key.code);
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
