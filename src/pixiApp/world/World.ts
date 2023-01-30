import {type Viewport} from 'pixi-viewport';
import type EntityCore from '../../../../core/src/entity/Entity';
import type IEntity from '../entity/Entity';
import WorldCore from '../../../../core/src/world/World';

export default class World extends WorldCore {
	constructor(public viewport: Viewport) {
		super();
	}

	add(entity: EntityCore & IEntity) {
		super.add(entity);
		this.viewport.addChild(entity.displayObject);
	}

	remove(entity: EntityCore & IEntity) {
		super.remove(entity);
		this.viewport.removeChild(entity.displayObject);
	}
}
