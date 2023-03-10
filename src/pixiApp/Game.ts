import Stats from 'stats.js';
import type {Vector} from 'detect-collisions';
import type * as PIXI from 'pixi.js';
import nipplejs, {type JoystickManager} from 'nipplejs';
import type * as WorldServer from '@gunsurvival/server/world';
import {lerp, lerpAngle, World as WorldCore, Entity as EntityCore, Player} from '@gunsurvival/core';
import {type Room, Client} from '../lib/colyseus.js';
import * as World from './world/index.js';
import {ENDPOINT} from '../constant.js';

export default class Game {
	stats = {
		fps: new Stats(),
		ping: new Stats(),
	};

	client = new Client(ENDPOINT);
	room: Room<WorldServer.Casual>;
	world = new World.Casual();
	player = new Player.Casual<EntityCore.default>();
	mobile: {
		moveJoystick?: JoystickManager;
		aimJoystick?: JoystickManager;
	} = {
			moveJoystick: undefined,
			aimJoystick: undefined,
		};

	elapsedMs = 0;
	accumulator = 0;
	targetDelta: number;
	pointerPos = {x: 0, y: 0};
	followPos: Vector = {x: 0, y: 0};
	tps = 0;
	elapseTick = 0;
	tpsCountInterval: number;
	ping: number;

	constructor(public targetTps = 60) {
		// Const magicNumber = (0.1 * 128 / tps); // Based on 128 tps, best run on 1-1000tps
		this.targetDelta = 1000 / targetTps;
	}

	playAs(entityCore: EntityCore.default) {
		const entityClient = this.world.entities.get(entityCore.id);
		if (entityClient) {
			entityClient.isPlayer = true;
		}

		this.player.playAs(entityCore);
		this.cameraFollow(this.player.entity);
		let oldAngle = 0;
		setInterval(() => {
			const angle = Math.round(entityCore.body.angle * 100) / 100;
			if (oldAngle !== angle) {
				this.room.send('angle',	entityCore.body.angle);
				oldAngle = angle;
			}
		}, 1000 / 20);
	}

	cameraFollow(entityCore: EntityCore.default) {
		this.followPos = entityCore.body.pos;
	}

	mobileSupport() {
		document.getElementById('move-zone')!.style.display = 'block';
		document.getElementById('aim-zone')!.style.display = 'block';
		this.initJoystick();
	}

	initJoystick() {
		// Move joystick
		this.mobile.moveJoystick = nipplejs.create({
			zone: document.querySelector<HTMLElement>('#move-zone')!,
			color: 'blue',
			multitouch: false,
		});
		this.mobile.moveJoystick.on('end', () => {
			this.moveDirection('stop');
		});
		this.mobile.moveJoystick.on('move', (evt, data) => {
			if (!data.direction) {
				return;
			}

			this.moveDirection('stop');
			const directionX = 'left';
			const directionY = 'top';

			const nX = Math.abs(Math.cos(data.angle.radian));
			const nY = Math.abs(Math.sin(data.angle.radian));
			const diff = Math.abs(nX - nY);
			if (diff < 0.5) {
				this.moveDirection(data.direction.x);
				this.moveDirection(data.direction.y);
			} else {
				this.moveDirection(nX > nY ? data.direction.x : data.direction.y);
			}
		});

		// Aim joystick
		this.mobile.aimJoystick = nipplejs.create({
			zone: document.querySelector<HTMLElement>('#aim-zone')!,
			color: 'blue',
			multitouch: false,
		});
		this.mobile.aimJoystick.on('end', () => {
			this.shootDirection(0, true);
		});
		this.mobile.aimJoystick.on('move', (evt, data) => {
			if (!data.direction) {
				return;
			}

			this.shootDirection(lerpAngle(this.player.entity.body.angle, -data.angle.radian, 1));
		});
	}

	init() {
		this.resize();
		this.intervalCheckPing();

		// Show stats: fps, ping
		this.stats.fps.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild(this.stats.fps.dom);
		this.stats.ping.showPanel(1);
		document.body.appendChild(this.stats.ping.dom);

		const worldCore = new WorldCore.Casual();
		this.world.useWorld(worldCore);
		if (this.isMobile()) {
			this.mobileSupport();
		}

		this.countTps();

		this.world.app.ticker.add(() => {
			const {deltaMS} = this.world.app.ticker;

			this.accumulator += deltaMS;
			this.stats.fps.begin();
			while (this.accumulator >= this.targetDelta) {
				this.elapseTick++;
				this.accumulator -= this.targetDelta;
				const tickData = {
					accumulator: this.accumulator,
					elapsedMs: this.elapsedMs,
					deltaMs: this.targetDelta,
					delta: 1,
				};

				// If (this.player.entity?.id === this.room.sessionId) {
				// 	this.player.update(this.world.worldCore, tickData);
				// }

				this.world.nextTick(tickData);
				this.elapsedMs += this.targetDelta;
				if (this.player.entity) {
					const camX = ((-this.followPos.x * this.world.viewport.scale._x) + (window.innerWidth / 2));
					const camY = ((-this.followPos.y * this.world.viewport.scale._y) + (window.innerHeight / 2));
					this.world.viewport.position.set(lerp(this.world.viewport.position.x, camX, 0.03), lerp(this.world.viewport.position.y, camY, 0.03));

					// Update player angle to mouse
					const entity = this.world.entities.get(this.player.entity.id);
					if (entity && !this.isMobile()) {
						const playerX = entity.displayObject.position.x;
						const playerY = entity.displayObject.position.y;
						const playerScreenPos = this.world.viewport.toScreen(playerX, playerY);
						this.player.entity.body.angle = Math.atan2(
							this.pointerPos.y - playerScreenPos.y,
							this.pointerPos.x - playerScreenPos.x,
						);
					}
				}
			}

			this.stats.ping.end();
		});

		this.world.app.stage.interactive = true;
		this.world.app.stage.hitArea = this.world.app.screen;

		this.world.app.stage.addEventListener('pointermove', (event: Event) => {
			const {global} = event as PIXI.FederatedMouseEvent;
			this.pointerPos.x = global.x;
			this.pointerPos.y = global.y;
		});

		window.onresize = ev => {
			this.resize();
		};

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

			// !!! this.world.add call physics.addBody(entityCore.body) so we need to init entityCore.body first !!!
			entityCore.init({...entityServer});
			this.world.add(entityCore);

			const entityClient = this.world.entities.get(entityServer.id);
			if (entityClient) {
				entityClient.hookStateChange(entityServer);
			} else {
				console.log(entityServer.id, entityCore);
			}

			if (sessionId === this.room.sessionId) {
				this.playAs(entityCore);
			}
		};

		this.room.state.entities.onRemove = (entityServer, sessionId: string) => {
			try {
				const entity = this.world.entities.get(entityServer.id);
				if (!entity) {
					return;
				}

				this.world.remove(entity.entityCore);
			} catch (e) {
				console.log(entityServer);
				console.log(e);
			}
		};
	}

	get isOnline() {
		return this.room !== undefined;
	}

	countTps() {
		this.tpsCountInterval = setInterval(() => {
			this.tps = this.elapseTick;
			this.elapseTick = 0;
		}, 1000);
	}

	moveDirection(direction: 'up' | 'left' | 'right' | 'down' | 'stop', isKeydown = true) {
		switch (direction) {
			case 'up':
				this.player.state.keyboard.w = isKeydown;
				this.room.send(isKeydown ? 'keyDown' : 'keyUp', 'w');
				break;
			case 'left':
				this.player.state.keyboard.a = isKeydown;
				this.room.send(isKeydown ? 'keyDown' : 'keyUp', 'a');
				break;
			case 'down':
				this.player.state.keyboard.s = isKeydown;
				this.room.send(isKeydown ? 'keyDown' : 'keyUp', 's');
				break;
			case 'right':
				this.player.state.keyboard.d = isKeydown;
				this.room.send(isKeydown ? 'keyDown' : 'keyUp', 'd');
				break;
			case 'stop':
				this.player.state.keyboard.w = false;
				this.player.state.keyboard.a = false;
				this.player.state.keyboard.s = false;
				this.player.state.keyboard.d = false;
				this.room.send('keyUp', 'w');
				this.room.send('keyUp', 'a');
				this.room.send('keyUp', 's');
				this.room.send('keyUp', 'd');
				break;
			default:
				break;
		}
	}

	shootDirection(angle: number, stop = false) {
		if (stop) {
			this.player.state.mouse.left = false;
			this.room.send('mouseUp', 'left');
			return;
		}

		// Console.log(angle);
		this.player.entity.body.angle = angle;
		this.player.state.mouse.left = true;
		this.room.send('mouseDown', 'left');
	}

	resize() {
		const fitWidth = window.innerWidth / 1920;
		const fitHeight = window.innerHeight / 948;
		this.world.viewport.setZoom(Math.max(fitWidth, fitHeight), true);
		this.world.app.resize();
	}

	isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

	intervalCheckPing() {
		this.stats.ping.begin();
		this.room.send('ping');
		this.room.onMessage('pong', (lastClientTime: number) => {
			this.stats.ping.end();
			this.ping = Date.now() - lastClientTime;
			setTimeout(() => {
				this.room.send('ping');
				this.stats.ping.begin();
			}, 1000);
			console.log(this.ping);
		});
	}
}
