import type {Vector} from 'detect-collisions';
import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import {lerp, lerpAngle} from '@gunsurvival/core/util';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';
import * as Entity from '../entity/index.js';
import {type ITickData} from '@gunsurvival/core/types';

export default class World {
	app = new PIXI.Application({
		width: 1366,
		height: 768,
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
		this.worldCore.entities.onAdd = (entityCore: EntityCore.default) => {
			const EntityClass = (Entity as Record<string, unknown>)[entityCore.constructor.name] as new (entC: EntityCore.default) => Entity.default;
			const entityInstance = new EntityClass(entityCore);
			this.entities.set(entityCore.id, entityInstance);
			this.viewport.addChild(entityInstance.displayObject);
		};

		this.worldCore.entities.onRemove = (entityCore: EntityCore.default) => {
			const entity = this.entities.get(entityCore.id);
			if (entity) {
				this.viewport.removeChild(entity.displayObject);
			}

			this.entities.delete(entityCore.id);
		};
	}

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
