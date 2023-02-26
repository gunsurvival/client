import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import type {World as WorldCore, Entity as EntityCore, ITickData} from '@gunsurvival/core';
import * as Entity from '../entity/index.js';

export default class World {
	app = new PIXI.Application({
		width: window.innerWidth,
		height: window.innerHeight,
		backgroundColor: '#133a2b',
		antialias: true,
	});

	viewport = new Viewport({
		screenWidth: this.app.screen.width,
		screenHeight: this.app.screen.height,
	});

	entities = new Map<string, Entity.default>();
	worldCore: WorldCore.default; // Reference to the room state if online or create new World if offline

	constructor() {
		this.app.stage.addChild(this.viewport);
	}

	useWorld(world: WorldCore.default) {
		this.worldCore = world;
		this.worldCore.event.on('+entities', (entityCore: EntityCore.default) => {
			const EntityClass = (Entity as Record<string, unknown>)[entityCore.constructor.name] as new (entC: EntityCore.default) => Entity.default;
			const entityClient = new EntityClass(entityCore);
			this.entities.set(entityCore.id, entityClient);
			this.viewport.addChild(entityClient.displayObject);
			entityClient.onAdd(entityCore);
		});

		this.worldCore.event.on('-entities', (entityCore: EntityCore.default) => {
			const entity = this.entities.get(entityCore.id);
			if (entity) {
				this.viewport.removeChild(entity.displayObject);
				this.entities.delete(entityCore.id);
				entity.onRemove(entityCore);
			}
		});

		// TODO: Them setValue(field, value) vao EntityCore de thay doi gia tri cua Entity va hook vao day de update
	}

	/** *************************** Alias methods below (reference to world core methods) */

	add(entityCore: EntityCore.default) {
		this.worldCore.add(entityCore);
	}

	remove(entityCore: EntityCore.default) {
		this.worldCore.remove(entityCore);
	}

	nextTick(tickData: ITickData) {
		this.worldCore.nextTick(tickData);
		this.entities.forEach((entity: Entity.default) => {
			entity.update(this.worldCore, tickData);
		});
	}
}
