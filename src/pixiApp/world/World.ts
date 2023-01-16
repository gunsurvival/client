import {type Viewport} from 'pixi-viewport';
import type * as PIXI from 'pixi.js';
import type Entity from '../../../../core/src/entity/Entity';
import WorldCore from '../../../../core/src/world/World';
import type IEntity from '../entity/Entity';

export default class World extends WorldCore {
	constructor(public viewport: Viewport) {
		super();
	}

	add(entity: Entity & IEntity) {
		super.add(entity);
		this.viewport.addChild(entity.displayObject);
	}

	remove(entity: Entity & IEntity) {
		super.add(entity);
		this.viewport.addChild(entity.displayObject);
	}
}
