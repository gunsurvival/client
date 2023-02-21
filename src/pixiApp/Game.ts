import type {Vector} from 'detect-collisions';
import type * as PIXI from 'pixi.js';
import {lerp, lerpAngle} from '@gunsurvival/core/util';
import * as WorldCore from '@gunsurvival/core/world';
import * as EntityCore from '@gunsurvival/core/entity';
import * as Player from '@gunsurvival/core/player';
import type * as WorldServer from '@gunsurvival/server/world';
import type * as RoomServer from '@gunsurvival/server/room';
import {type Room, Client, type DataChange} from '../lib/colyseus.js';
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
	tps = 0;
	elapseTick = 0;
	tpsCountInterval: NodeJS.Timeout;

	constructor(public tps = 60) {
		// Const magicNumber = (0.1 * 128 / tps); // Based on 128 tps, best run on 1-1000tps
		this.targetDelta = 1000 / this.tps;
	}

	playAs(entityCore: EntityCore.default) {
		this.player.playAs(entityCore);
		this.cameraFollow(this.player.entity);
		let oldAngle = Math.round(this.player.entity.body.angle * 100) / 100;
		setInterval(() => {
			if (oldAngle !== Math.round(this.player.entity.body.angle * 100) / 100) {
				this.room.send('angle',	this.player.entity.body.angle);
				oldAngle = Math.round(this.player.entity.body.angle * 100) / 100;
			}
		}, 1000 / 20);
	}

	cameraFollow(entityCore: EntityCore.default) {
		this.followPos = entityCore.body.pos;
	}

	init() {
		const worldCore = new WorldCore.Casual();
		this.world.useWorld(worldCore);
		this.countTps();

		this.world.app.ticker.add(() => {
			this.accumulator += this.world.app.ticker.deltaMS;
			while (this.accumulator >= this.targetDelta) {
				this.elapseTick++;
				this.accumulator -= this.targetDelta;
				const tickData = {
					accumulator: this.accumulator,
					elapsedMs: this.elapsedMs,
					deltaMs: this.targetDelta,
					delta: 1,
				};

				if (this.player.entity?.id === this.room.sessionId) {
					this.player.update(this.world.worldCore, tickData);
				}

				this.world.nextTick(tickData);
				this.elapsedMs += this.targetDelta;

				if (this.player.entity) {
					const camX = -this.followPos.x + (this.world.viewport.screenWidth / 2);
					const camY = -this.followPos.y + (this.world.viewport.screenHeight / 2);
					this.world.viewport.position.set(lerp(this.world.viewport.position.x, camX, 0.03), lerp(this.world.viewport.position.y, camY, 0.03));

					const entity = this.world.entities.get(this.player.entity.id)!;
					const playerX = entity.displayObject.position.x;
					const playerY = entity.displayObject.position.y;
					const playerScreenPos = this.world.viewport.toScreen(playerX, playerY);
					this.player.entity.body.angle = Math.atan2(
						this.pointerPos.y - playerScreenPos.y,
						this.pointerPos.x - playerScreenPos.x,
					);
				}
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
						this.player.state.keyboard.w = true;
						this.room.send('keyDown', 'w');
						break;
					case 'KeyA':
						this.player.state.keyboard.a = true;
						this.room.send('keyDown', 'a');
						break;
					case 'KeyS':
						this.player.state.keyboard.s = true;
						this.room.send('keyDown', 's');
						break;
					case 'KeyD':
						this.player.state.keyboard.d = true;
						this.room.send('keyDown', 'd');
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
						this.player.state.keyboard.w = false;
						this.room.send('keyUp', 'w');
						break;
					case 'KeyA':
						this.player.state.keyboard.a = false;
						this.room.send('keyUp', 'a');
						break;
					case 'KeyS':
						this.player.state.keyboard.s = false;
						this.room.send('keyUp', 's');
						break;
					case 'KeyD':
						this.player.state.keyboard.d = false;
						this.room.send('keyUp', 'd');
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
						this.player.state.mouse.left = true;
						this.room.send('mouseDown', 'left');
						break;
					case 1:
						this.player.state.mouse.middle = true;
						this.room.send('mouseDown', 'middle');
						break;
					case 2:
						this.player.state.mouse.right = true;
						this.room.send('mouseDown', 'right');
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
						this.player.state.mouse.left = false;
						this.room.send('mouseUp', 'left');
						break;
					case 1:
						this.player.state.mouse.middle = false;
						this.room.send('mouseUp', 'middle');
						break;
					case 2:
						this.player.state.mouse.right = false;
						this.room.send('mouseUp', 'right');
						break;
					default:
						break;
				}
			}
		});
	}

	async connect() {
		this.room = await this.client.joinOrCreate<WorldServer.Casual>('casual');

		this.room.state.entities.onAdd = (entityServer, sessionId: string) => {
			// Redefine this if constructor Entity.js is changed
			const EntityCoreClass = (EntityCore as Record<string, unknown>)[entityServer.name] as (new () => EntityCore.default);
			const entityCore = new EntityCoreClass();

			entityCore.body.scale = entityServer.scale;
			entityCore.body.angle = entityServer.angle;
			entityCore.body.pos.x = entityServer.pos.x;
			entityCore.body.pos.y = entityServer.pos.y;
			entityCore.body.offset.x = entityServer.offset.x;
			entityCore.body.offset.y = entityServer.offset.y;

			if (sessionId === this.room.sessionId) {
				entityCore.id = this.room.sessionId;
			}

			this.world.add(entityCore);
			const entity = this.world.entities.get(entityCore.id)!;
			if (sessionId === this.room.sessionId) {
				this.playAs(entityCore);
			}

			entity.onCreate(entityServer.entityCore);
			this.world.viewport.addChild(entity.displayObject);

			// TODO: lam dep khuc on change nay
			entityServer.onChange = (changes: DataChange[]) => {
				changes.forEach((change: DataChange) => {
					if (sessionId === this.room.sessionId) {
						return;
					}

					switch (change.field) {
						case 'angle':
							entityCore.body.angle = change.value as number;
							break;
						case 'scale':
							entityCore.body.scale = change.value as number;
							break;
						default:
							break;
					}
				});
			};

			entityServer.pos.onChange = (changes: DataChange[]) => {
				changes.forEach((change: DataChange) => {
					if (sessionId === this.room.sessionId) {
						switch (change.field) {
							case 'x':
								entityCore.body.pos.x = lerp(entityCore.body.pos.x, change.value as number, 0.01);
								break;
							case 'y':
								entityCore.body.pos.y = lerp(entityCore.body.pos.y, change.value as number, 0.01);
								break;
							default:
								break;
						}

						return;
					}

					switch (change.field) {
						case 'x':
							entityCore.body.pos.x = change.value as number;
							break;
						case 'y':
							entityCore.body.pos.y = change.value as number;
							break;
						default:
							break;
					}
				});
			};

			entityServer.offset.onChange = (changes: DataChange[]) => {
				changes.forEach((change: DataChange) => {
					if (sessionId === this.room.sessionId) {
						return;
					}

					switch (change.field) {
						case 'x':
							entityCore.body.offset.x = change.value as number;
							break;
						case 'y':
							entityCore.body.offset.y = change.value as number;
							break;
						default:
							break;
					}
				});
			};
		};

		this.room.state.entities.onRemove = (entityServer, sessionId: string) => {
			this.world.viewport.removeChild(this.world.entities.get(entityServer.entityCore.id)!.displayObject);
			this.world.worldCore.remove(entityServer.entityCore);
		};

		this.room.onMessage('hello', message => {
			console.log(message);
		});
	}

	get isOnline() {
		return this.room !== undefined;
	}

	countTps() {
		this.tpsCountInterval = setInterval(() => {
			this.tps = this.elapseTick;
			this.elapseTick = 0;
			console.log(this.tps);
		}, 1000);
	}
}
