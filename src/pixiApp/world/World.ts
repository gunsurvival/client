import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import type {World as WorldCore, Entity as EntityCore, ITickData} from '@gunsurvival/core';
import * as Entity from '../entity/index.js';
import * as PIXIFilter from 'pixi-filters';

export default class World {
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
		lightMap: new PIXIFilter.SimpleLightmapFilter(PIXI.Texture.from('images/lightmap.png')),
		zoomBlur: new PIXIFilter.ZoomBlurFilter({
			strength: 0,
			center: new PIXI.Point(this.app.screen.width / 2, this.app.screen.height / 2),
			innerRadius: 200,
		}),
	};

	entities = new Map<string, Entity.default>();
	worldCore: WorldCore.default; // Reference to the room state if online or create new World if offline

	constructor() {
		// Const radius = this.app.screen.width / 3;
		// const blurSize = 10;

		// const circle = new PIXI.Graphics()
		// 	.beginFill('0xFF0000')
		// 	.drawCircle(radius + blurSize, radius + blurSize, radius)
		// 	.endFill();
		// circle.filters = [new PIXI.BlurFilter(blurSize)];

		// const bounds = new PIXI.Rectangle(0, 0, (radius + blurSize) * 2, (radius + blurSize) * 2);
		// const texture = this.app.renderer.generateTexture(circle, {
		// 	scaleMode: PIXI.SCALE_MODES.NEAREST,
		// 	resolution: 1,
		// 	region: bounds,
		// });
		//     const focus = new PIXI.Sprite(texture);

		// this.viewport.mask = focus;
		// this.app.stage.addChild(focus);
		this.viewport.sortableChildren = true;
		this.filters.lightMap.enabled = false;
		this.viewport.filters = [this.filters.lightMap, this.filters.zoomBlur];
		this.app.stage.addChild(this.viewport);
	}

	useWorld(world: WorldCore.default) {
		this.worldCore = world;
		this.worldCore.lockApi = true;
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
