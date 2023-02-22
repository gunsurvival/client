
import type {DisplayObject} from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';

export default abstract class Entity {
	abstract displayObject: DisplayObject;

	// If redefine this constructor, you must redefine the constructor of EntityClass Game.connect()
	constructor(public entityCore: EntityCore.default) {

	}

	useEntity(entityCore: EntityCore.default) {
		this.entityCore = entityCore;
	}

	update(world: WorldCore.default, tickData: ITickData) {}
	onAdd(coreEntity: EntityCore.default) {}
	onRemove(coreEntity: EntityCore.default) {}
}
