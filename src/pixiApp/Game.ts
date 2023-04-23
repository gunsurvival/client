import {zzfx} from 'zzfx';
import {SATVector} from 'detect-collisions';
import Stats from 'stats.js';
import type * as PIXI from 'pixi.js';
import nipplejs, {type JoystickManager} from 'nipplejs';
import type * as WorldServer from '@gunsurvival/server/world';
import {lerp, lerpAngle, World as WorldCore, Entity as EntityCore, Player} from '@gunsurvival/core';
import {type Room, Client} from '../lib/colyseus.js';
import {Camera} from './utils/Camera.js';
import * as World from './world/index.js';
import {ENDPOINT} from '../constant.js';
import {store} from '../app/store.js';
import {choose} from '../slices/ItemBarSlice.js';

export default class Game {
	tps = 0;
	elapsedMs = 0;
	elapseTick = 0;
	accumulator = 0;
	ping: number;
	targetDelta: number;
	tpsCountInterval: number;
	pointerPos = new SATVector(0, 0);
	client = new Client(ENDPOINT);
	room: Room<WorldServer.Casual>;
	world = new World.Casual();
	player = new Player.Casual(true);
	camera = new Camera(this.world);

	mobile: {
		moveJoystick?: JoystickManager;
		aimJoystick?: JoystickManager;
	} = {
			moveJoystick: undefined,
			aimJoystick: undefined,
		};

	stats = {
		fps: new Stats(),
		ping: new Stats(),
	};

	constructor(public targetTps = 60) {
		// Const magicNumber = (0.1 * 128 / tps); // Based on 128 tps, best run on 1-1000tps
		this.targetDelta = 1000 / targetTps;
	}

	get isOnline() {
		return this.room !== undefined;
	}

	get isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

	nextTick() {
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

			if (this.player.isReady) {
				this.player.update(this.world.worldCore, tickData);
			}

			this.world.nextTick(tickData);
			this.elapsedMs += this.targetDelta;
			if (this.player.entity) {
				// Update camera
				this.camera.update();

				// Update player angle to mouse
				const entity = this.world.entities.get(this.player.entity.id);
				if (entity && !this.isMobile) {
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

		this.stats.fps.end();
	}

	playAs(entityCore: EntityCore.default) {
		const entityClient = this.world.entities.get(entityCore.id);
		if (entityClient) {
			entityClient.isPlayer = true;
		}

		this.player.playAs(entityCore);
		this.camera.follow(entityCore.body.pos);
		let oldAngle = 0;
		setInterval(() => {
			const angle = Math.round(entityCore.body.angle * 100) / 100;
			if (oldAngle !== angle) {
				this.room.send('angle',	entityCore.body.angle);
				oldAngle = angle;
			}
		}, 1000 / 20);
	}

	init() {
		this.resize();
		this.intervalCheckPing();
		this.intervalCheckTps();
		this.setupPanel();
		this.setupPlayerEvent();
		this.setupGlobalEvent();
		this.setupPIXIPointer();
		if (this.isMobile) {
			this.mobileSupport();
		}

		this.world.useWorld(new WorldCore.Casual());
		this.world.app.ticker.add(this.nextTick.bind(this));
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

	mobileSupport() {
		document.getElementById('move-zone')!.style.display = 'block';
		document.getElementById('aim-zone')!.style.display = 'block';
		this.setupJoystick();
	}

	intervalCheckPing() {
		this.stats.ping.begin();
		this.room.send('ping');

		this.room.onMessage('pong', (serverTime: number) => {
			this.stats.ping.end();
			this.ping = Date.now() - serverTime;
			setTimeout(() => {
				this.stats.ping.begin();
				this.room.send('ping');
			}, 1000);
		});
	}

	intervalCheckTps() {
		this.tpsCountInterval = setInterval(() => {
			this.tps = this.elapseTick;
			this.elapseTick = 0;
		}, 1000);
	}

	setupPanel() {
		// Show stats: fps, ping
		this.stats.fps.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild(this.stats.fps.dom);
		this.stats.ping.showPanel(1);
		document.body.appendChild(this.stats.ping.dom);
		this.stats.ping.dom.style.left = '100px';
	}

	setupPlayerEvent() {
		this.player.event.on('shoot', () => {
			this.camera.shake(10);
			zzfx(1.01, 0.05, 115, 0.01, 0.03, 0.08, 2, 1.85, -8.4, 0, 0, 0, 0, 0, 0, 0, 0, 0.54, 0.03, 0.46);
		});

		this.player.event.on('collision-enter', () => {
			this.world.filters.lightMap.enabled = true;
		});

		this.player.event.on('collision-exit', () => {
			this.world.filters.lightMap.enabled = false;
		});

		// Inventory
		this.player.inventory.event.on('choose', indexes => {
			store.dispatch(choose(indexes));
		});
	}

	setupGlobalEvent() {
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
					case 'Digit1':
						store.dispatch(choose([0]));
						break;
					case 'Digit2':
						store.dispatch(choose([1]));
						break;
					case 'Digit3':
						store.dispatch(choose([2]));
						break;
					case 'Digit4':
						store.dispatch(choose([3]));
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
				this.player.event.emit('mousedown', mouse).catch(console.error);
				this.room.send('mouseDown', ['left', 'middle', 'right'][mouse.button]);
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

		window.onresize = ev => {
			this.resize();
		};

		window.addEventListener('wheel', event => {
			const current = store.getState().itemBarSlice;
			if (current.choosing.length === 1) { // Check if only one item is choosing
				let choosing = current.choosing[0] + Math.sign(event.deltaY);
				if (choosing < 0) {
					choosing = current.items.length - 1;
				}

				if (choosing >= current.items.length) {
					choosing = 0;
				}

				store.dispatch(choose([choosing]));
			}
		});
	}

	setupPIXIPointer() {
		this.world.app.stage.interactive = true;
		this.world.app.stage.hitArea = this.world.app.screen;

		this.world.app.stage.addEventListener('pointermove', (event: Event) => {
			const {global} = event as PIXI.FederatedMouseEvent;
			this.pointerPos.x = global.x;
			this.pointerPos.y = global.y;
		});
	}

	setupJoystick() {
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
}
