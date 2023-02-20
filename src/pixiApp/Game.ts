import type {Vector} from 'detect-collisions';
import type * as PIXI from 'pixi.js';
import {lerp, lerpAngle} from '@gunsurvival/core/util';
import * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';
import * as Player from '@gunsurvival/core/player';
import type * as WorldServer from '@gunsurvival/server/world';
import type * as RoomServer from '@gunsurvival/server/room';
import {type Room, Client} from '../lib/colyseus.js';
import * as Entity from './entity/index.js';
import * as World from './world/index.js';
import {ENDPOINT} from '../constant.js';

export default class Game {
	client = new Client(ENDPOINT);
	room: Room<WorldServer.Casual>;
	world = new World.Casual();
	player = new Player.Casual<EntityCore.default>();

	elapsedMs = 0;
	accumulator = 0;
	targetDelta: number;
	pointerPos = {x: 0, y: 0};
	followPos: Vector = {x: 0, y: 0};

	constructor(public tps = 60) {
		this.targetDelta = 1000 / this.tps;
	}

	playAs(entity: EntityCore.default) {
		this.player.playAs(entity);
		this.cameraFollow(this.player.entity);
	}

	cameraFollow(entity: EntityCore.default) {
		this.followPos = entity.body.pos;
	}

	init() {
		const worldCore = new WorldCore.Casual();
		this.world.useWorld(worldCore);

		this.world.app.ticker.add(() => {
			this.accumulator += this.world.app.ticker.deltaMS;
			while (this.accumulator >= this.targetDelta) {
				this.accumulator -= this.targetDelta;
				const tickData = {
					accumulator: this.accumulator,
					elapsedMs: this.elapsedMs,
					deltaMs: this.targetDelta,
					delta: 1,
				};

				if (this.player.entity) {
					this.player.update(this.world.worldCore, tickData);
				}

				this.world.nextTick(tickData);
				this.elapsedMs += this.targetDelta;
			}

			if (this.player.entity) {
				const camX = -this.followPos.x + (this.world.viewport.screenWidth / 2);
				const camY = -this.followPos.y + (this.world.viewport.screenHeight / 2);
				this.world.viewport.position.set(lerp(this.world.viewport.position.x, camX, 0.05), lerp(this.world.viewport.position.y, camY, 0.05));

				const playerX = this.player.entity.body.pos.x;
				const playerY = this.player.entity.body.pos.y;
				const playerScreenPos = this.world.viewport.toScreen(playerX, playerY);
				this.player.entity.body.angle = lerpAngle(this.player.entity.body.angle, Math.atan2(
					this.pointerPos.y - playerScreenPos.y,
					this.pointerPos.x - playerScreenPos.x,
				), 0.3);
			}
		});

		this.world.app.stage.interactive = true;
		this.world.app.stage.hitArea = this.world.app.screen;

		this.world.app.stage.addEventListener('pointermove', (event: Event) => {
			const {global} = event as PIXI.FederatedMouseEvent;
			this.pointerPos.x = global.x;
			this.pointerPos.y = global.y;
		});

		document.addEventListener('keydown', key => {
			if (this.isOnline) {
				switch (key.code) {
					case 'KeyW':
						this.room.send('keyDown', 'w');
						break;
					case 'KeyA':
						this.room.send('keyDown', 'a');
						break;
					case 'KeyS':
						this.room.send('keyDown', 's');
						break;
					case 'KeyD':
						this.room.send('keyDown', 'd');
						break;
					default:
						break;
				}
			} else {
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
			}
		});

		document.addEventListener('keyup', key => {
			if (this.isOnline) {
				switch (key.code) {
					case 'KeyW':
						this.room.send('keyUp', 'w');
						break;
					case 'KeyA':
						this.room.send('keyUp', 'a');
						break;
					case 'KeyS':
						this.room.send('keyUp', 's');
						break;
					case 'KeyD':
						this.room.send('keyUp', 'd');
						break;
					default:
						break;
				}
			} else {
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
			}
		});

		document.addEventListener('mousedown', mouse => {
			if (this.isOnline) {
				switch (mouse.button) {
					case 0:
						this.room.send('mouseDown', 'left');
						break;
					case 1:
						this.room.send('mouseDown', 'middle');
						break;
					case 2:
						this.room.send('mouseDown', 'right');
						break;
					default:
						break;
				}
			} else {
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
						break;
				}
			}
		});

		document.addEventListener('mouseup', mouse => {
			if (this.isOnline) {
				switch (mouse.button) {
					case 0:
						this.room.send('mouseUp', 'left');
						break;
					case 1:
						this.room.send('mouseUp', 'middle');
						break;
					case 2:
						this.room.send('mouseUp', 'right');
						break;
					default:
						break;
				}
			} else {
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
			}
		});
	}

	async connect() {
		this.room = await this.client.joinOrCreate<WorldServer.Casual>('casual');

		this.room.state.entities.onAdd = (entityServer, sessionId: string) => {
			const Ent = (Entity as Record<string, unknown>)[entityServer.entityCore.constructor.name] as (new (entC: EntityCore.default) => Entity.default); // Typedef: inherit class from Entity
			const ent = new Ent(entityServer.entityCore);
			ent.onCreate(entityServer.entityCore);
			this.world.viewport.addChild(ent.displayObject);

			// Detecting current user
			if (sessionId === this.room.sessionId) {
				this.playAs(ent.entityCore);
			}
		};

		this.room.state.entities.onRemove = (entityServer, sessionId: string) => {
			this.world.viewport.removeChild(this.world.entities.get(entityServer.entityCore.id)!.displayObject);
			this.world.worldCore.remove(entityServer.entityCore);
		};

		setInterval(() => {
			console.log(this.room.state.entities);
		}, 1000);
	}

	get isOnline() {
		return this.room !== undefined;
	}
}
