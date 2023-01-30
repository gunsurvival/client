import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import World from './world/World';
import type IEntity from './entity/Entity';
import type EntityCore from '../../../core/src/entity/Entity';
import {lerp, lerpAngle} from '../../../core/src/util/common';
import Player from '../../../core/src/player/Player.World';
import Bush from './entity/Bush';
import Rock from './entity/Rock';

export default class Game {
	deltaMs: number;
	player: Player<EntityCore & IEntity>;
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

	playAs(entity: EntityCore & IEntity) {
		this.player = new Player<EntityCore & IEntity>(entity);
		this.world.add(entity);
	}

	init() {
		this.app.stage.addChild(this.viewport);
		for (let i = -5000; i < 5000; i += Math.random() * 100) {
			for (let j = -5000; j < 5000; j += Math.random() * 100) {
				const rock = new Rock({x: i, y: j} as SAT.Vector);
				this.world.add(rock);
			}
		}

		this.app.ticker.add(() => {
			this.accumulator += this.app.ticker.deltaMS;
			while (this.accumulator >= this.deltaMs) {
				this.accumulator -= this.deltaMs;
				const tickData = {
					accumulator: this.accumulator,
					elapsedMs: this.elapsedMs,
					deltaMs: this.deltaMs,
					delta: 1,
				};

				this.player.update(this.world, tickData);
				this.world.nextTick(tickData);
				this.elapsedMs += this.deltaMs;
			}

			const camX = -this.player.entity.displayObject.position.x + (this.viewport.screenWidth / 2);
			const camY = -this.player.entity.displayObject.position.y + (this.viewport.screenHeight / 2);
			this.viewport.position.set(lerp(this.viewport.position.x, camX, 0.05), lerp(this.viewport.position.y, camY, 0.05));

			const playerScreenPos = this.viewport.toScreen(this.player.entity.body.x, this.player.entity.body.y);
			this.player.entity.body.setAngle(lerpAngle(this.player.entity.body.angle, Math.atan2( // Online
				this.pointerPos.y - playerScreenPos.y,
				this.pointerPos.x - playerScreenPos.x,
			), 0.3));
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
			}
		});

		document.addEventListener('mousedown', mouse => {
			switch (mouse.button) {
				case 0:
					this.player.state.mouse.left = true;
					break;
				case 1:
					this.player.state.mouse.middle = true;
					break;
				case 2:
					this.player.state.mouse.right = true;
					break;
				default:
			}
		});

		document.addEventListener('mouseup', mouse => {
			switch (mouse.button) {
				case 0:
					this.player.state.mouse.left = false;
					break;
				case 1:
					this.player.state.mouse.middle = false;
					break;
				case 2:
					this.player.state.mouse.right = false;
					break;
				default:
			}
		});
	}
}
