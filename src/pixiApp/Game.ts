import {type Room, Client} from 'colyseus.js';
import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import type Entity from './entity/Entity';
import * as Entities from './entity/index';
import type EntityCore from '../../../core/src/entity/Entity';
import {lerp, lerpAngle} from '../../../core/src/util/common';
import type Player from '@gunsurvival/core/src/player/World';
import type CasualState from '@gunsurvival/core/src/world/Casual';
import {type Vector} from 'detect-collisions';

const endpoint = 'http://localhost:3000';

export default class Game {
	client = new Client(endpoint);
	room: Room<CasualState>;
	targetDelta: number;
	elapsedMs = 0;
	accumulator = 0;
	app = new PIXI.Application({width: 1366, height: 768, backgroundColor: '#133a2b', antialias: true, autoDensity: true, resolution: window.devicePixelRatio || 1});
	viewport = new Viewport({
		screenWidth: this.app.screen.width,
		screenHeight: this.app.screen.height,

	});

	world: CasualState; // Reference to the room state
	pointerPos = {
		x: 0,
		y: 0,
	};

	player: Entity;
	followPos: Vector = {x: 0, y: 0};

	constructor(public tps = 60) {
		this.targetDelta = 1000 / this.tps;
	}

	playAs(entity: Entity) {
		this.player = entity;
		this.cameraFollow(entity);
	}

	cameraFollow(entity: Entity) {
		this.followPos = entity.displayObject.position;
	}

	init() {
		this.app.stage.addChild(this.viewport);

		this.app.ticker.add(() => {
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

			const playerX = this.player.displayObject.position.x;
			const playerY = this.player.displayObject.position.y;
			const playerScreenPos = this.viewport.toScreen(playerX, playerY);
			this.player.displayObject.angle = lerpAngle(this.player.displayObject.angle, Math.atan2(
				this.pointerPos.y - playerScreenPos.y,
				this.pointerPos.x - playerScreenPos.x,
			), 0.3);
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

	async connect() {
		this.room = await this.client.joinOrCreate<CasualState>('casual');
		this.world = this.room.state;
		this.room.state.entities.onAdd = (coreEntity, sessionId: string) => {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const Ent = (Entities as Record<string, unknown>)[coreEntity.name] as (new (entC: EntityCore) => Entity); // Typedef: inherit class from Entity
			const ent = new Ent(coreEntity);
			ent.onCreate(coreEntity);
			this.viewport.addChild(ent.displayObject);

			// Detecting current user
			if (sessionId === this.room.sessionId) {
				this.playAs(ent);
			}
		};

		this.room.state.entities.onRemove = (entity, sessionId: string) => {
			this.viewport.removeChild(this.world.entities.get(entity.id)!.displayObject);
		};
	}

	get isOnline() {
		return this.room !== undefined;
	}
}
