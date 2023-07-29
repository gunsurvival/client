import {Viewport} from 'pixi-viewport';
import * as PIXIFilter from 'pixi-filters';
import {zzfx} from 'zzfx';
import SAT from 'sat';
import Stats from 'stats.js';
import * as PIXI from 'pixi.js';
import nipplejs, {type JoystickManager} from 'nipplejs';
import type * as WorldServer from '@gunsurvival/server/world';
import {
	lerp,
	lerpAngle,
	World as WorldCore,
	Entity as EntityCore,
	Player,
} from '@gunsurvival/core';
import * as Entity from './entity/index.js';
import * as Colyseus from '../lib/colyseus.js';
import {Camera} from './utils/Camera.js';
import {ENDPOINT} from '../constant.js';
import {store} from '../app/store.js';
import * as ItemBarAction from '../slices/ItemBarSlice.js';
import {
	type IEvent,
	type WorldEventMap,
} from '@gunsurvival/core/world/World.js';

export default class Game {
	room: Colyseus.Room<WorldServer.Casual>;
	elapsedMs = 0;
	pointerPos = new SAT.Vector(0, 0);
	client = new Colyseus.Client(ENDPOINT);
	camera = new Camera(this);
	player = new Player.Casual();
	app = new PIXI.Application({
		width: window.innerWidth,
		height: window.innerHeight,
		backgroundColor: '#133a2b',
		antialias: true,
		resizeTo: window,
	});

	viewport = new Viewport({
		screenWidth: this.app.screen.width,
		screenHeight: this.app.screen.height,
	});

	filters = {
		lightMap: new PIXIFilter.SimpleLightmapFilter(
			PIXI.Texture.from('images/lightmap.png'),
		),
		zoomBlur: new PIXIFilter.ZoomBlurFilter({
			strength: 0,
			center: new PIXI.Point(
				this.app.screen.width / 2,
				this.app.screen.height / 2,
			),
			innerRadius: 200,
		}),
	};

	entities = new Map<string, Entity.default>();
	worldCore: WorldCore.default; // Reference to the room state if online or create new World if offline

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

	private readonly internal = {
		tps: 0,
		targetDelta: 0,
		elapsedMs: 0,
		elapseTick: 0,
		accumulator: 0,
		ping: 0,
		tpsCountInterval: 0,
	};

	constructor(public targetTps = 60) {
		// Const magicNumber = (0.1 * 128 / tps); // Based on 128 tps, best run on 1-1000tps
		this.internal.targetDelta = 1000 / targetTps;
		this.viewport.sortableChildren = true;
		this.filters.lightMap.enabled = false;
		this.viewport.filters = [this.filters.lightMap, this.filters.zoomBlur];
		this.app.stage.addChild(this.viewport);
	}

	get isOnline() {
		return this.room !== undefined;
	}

	get isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);
	}

	useWorld(world: WorldCore.default) {
		this.worldCore = world;
		this.worldCore.lockApi = true; // Lock the api to prevent any modification from client, only server can modify the world
		this.worldCore.isOnline = true; // Set the world to online mode, prevent any modification from client, only server can modify the world

		this.worldCore.event.on('+entities', (entityCore: EntityCore.default) => {
			const EntityClass = (Entity as Record<string, unknown>)[
				entityCore.constructor.name
			] as new (entC: EntityCore.default) => Entity.default;
			const entityClient = new EntityClass(entityCore);
			this.entities.set(entityCore.id, entityClient);
			this.viewport.addChild(entityClient.displayObject);
			entityClient.initCore(entityCore);
			const entityServer = this.room.state.entities.get(entityCore.id);
			if (entityServer) {
				entityClient.initServer(entityServer);
			} else {
				// Previous object that have been removed from the server but still exists on worldCore.events(api:entities add) to be re-add
			}

			if (entityCore.id === this.room.sessionId) {
				this.playAs(entityCore);
			}
		});

		this.worldCore.event.on('-entities', (entityCore: EntityCore.default) => {
			const entity = this.entities.get(entityCore.id);
			if (entity) {
				this.viewport.removeChild(entity.displayObject);
				this.entities.delete(entityCore.id);
				// Entity.onRemove(entityCore);
			}
		});
	}

	nextTick() {
		const {deltaMS} = this.app.ticker;
		const {internal} = this;

		internal.accumulator += deltaMS;
		this.stats.fps.begin();
		while (internal.accumulator >= internal.targetDelta) {
			internal.elapseTick++;
			internal.accumulator -= internal.targetDelta;
			const tickData = {
				accumulator: internal.accumulator,
				elapsedMs: internal.elapsedMs,
				deltaMs: internal.targetDelta,
				delta: 1,
			};

			this.worldCore.nextTick(tickData);

			if (this.player.isReady) {
				this.player.update(this.worldCore, tickData);
			}

			this.entities.forEach((entity: Entity.default) => {
				entity.update(this, tickData);
			});
			internal.elapsedMs += internal.targetDelta;
			if (this.player.entity) {
				// Update camera
				this.camera.update();

				// Update player angle to mouse
				const {entity} = this.player;
				if (entity && !this.isMobile) {
					const playerX = entity.body.pos.x;
					const playerY = entity.body.pos.y;
					const playerScreenPos = this.viewport.toScreen(playerX, playerY);
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
		const entity = this.entities.get(entityCore.id);
		if (entity) {
			entity.isUser = true;
		}

		this.player.playAs(entityCore);
		this.camera.follow(entityCore.body.pos);
		let oldAngle = 0;
		setInterval(() => {
			const angle = Math.round(entityCore.body.angle * 100) / 100;
			if (oldAngle !== angle) {
				this.room.send('angle', entityCore.body.angle);
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
		this.mobileSupport();

		this.useWorld(new WorldCore.Casual());
		this.app.ticker.add(this.nextTick.bind(this));
	}

	async connect() {
		this.room = await this.client.joinOrCreate<WorldServer.Casual>('casual');
		this.room.state.events.onAdd(event => {
			const ev: IEvent = {
				type: event.type,
				args: JSON.parse(event.args) as any[],
			};
			this.worldCore.events.push(ev);
			this.worldCore.event.emit('+events', ev).catch(console.error);
			this.worldCore.event
				.emit(ev.type as keyof WorldEventMap, ...(ev.args as any))
				.catch(console.error);
		});
	}

	moveDirection(
		direction: 'up' | 'left' | 'right' | 'down' | 'stop',
		isKeydown = true,
	) {
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
		if (!this.player.entity) {
			return;
		}

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
		this.viewport.setZoom(Math.max(fitWidth, fitHeight), true);
		this.app.resize();
	}

	mobileSupport() {
		if (!this.isMobile) {
			return;
		}

		document.getElementById('move-zone')!.style.display = 'block';
		document.getElementById('aim-zone')!.style.display = 'block';
		this.setupJoystick();
	}

	intervalCheckPing() {
		this.stats.ping.begin();
		this.room.send('ping');

		this.room.onMessage('pong', (serverTime: number) => {
			this.stats.ping.end();
			this.internal.ping = Date.now() - serverTime;
			setTimeout(() => {
				this.stats.ping.begin();
				this.room.send('ping');
			}, 1000);
		});
	}

	intervalCheckTps() {
		this.internal.tpsCountInterval = window.setInterval(() => {
			this.internal.tps = this.internal.elapseTick;
			this.internal.elapseTick = 0;
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
			zzfx(
				1.01,
				0.05,
				115,
				0.01,
				0.03,
				0.08,
				2,
				1.85,
				-8.4,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0.54,
				0.03,
				0.46,
			);
		});

		// Setup player after main entity spawned
		this.player.event.on('ready', () => {
			this.player.entity.event.on(
				'collision-enter',
				(entity: EntityCore.default) => {
					if (entity instanceof EntityCore.Bush) {
						this.filters.lightMap.enabled = true;
					}
				},
			);

			this.player.entity.event.on(
				'collision-exit',
				(entity: EntityCore.default) => {
					if (entity instanceof EntityCore.Bush) {
						this.filters.lightMap.enabled = false;
					}
				},
			);

			// Inventory
			this.player.entity.inventory.event.on('choose', indexes => {
				store.dispatch(ItemBarAction.choose(indexes));
				this.room.send('inventory-choose', indexes);
				if (indexes.length === 1) {
					// This.weapon.change(this.player.inventory.current[0]);
				}
			});

			this.player.entity.inventory.event.on('add', (item, opts) => {
				store.dispatch(ItemBarAction.add({item, opts}));
			});

			store.dispatch(
				ItemBarAction.updateAll(
					this.player.entity.inventory.items.map(item => ({
						id: item.id,
						amount: item.amount,
					})),
				),
			);
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
						this.player?.entity.inventory.choose(0).catch(console.error);
						break;
					case 'Digit2':
						this.player?.entity.inventory.choose(1).catch(console.error);
						break;
					case 'Digit3':
						this.player?.entity.inventory.choose(2).catch(console.error);
						break;
					case 'Digit4':
						this.player?.entity.inventory.choose(3).catch(console.error);
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
			if (current.choosing.length === 1) {
				// Check if only one item is choosing
				let choosing = current.choosing[0] + Math.sign(event.deltaY);
				if (choosing < 0) {
					choosing = current.items.length - 1;
				}

				if (choosing >= current.items.length) {
					choosing = 0;
				}

				this.player.entity.inventory.choose(choosing).catch(console.error);
			}
		});
	}

	setupPIXIPointer() {
		this.app.stage.interactive = true;
		this.app.stage.hitArea = this.app.screen;

		this.app.stage.addEventListener('pointermove', (event: Event) => {
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

			this.shootDirection(
				lerpAngle(this.player?.entity.body.angle, -data.angle.radian, 1),
			);
		});
	}
}
