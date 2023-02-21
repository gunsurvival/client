
import type {DisplayObject} from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';

export default abstract class Entity {
	elapseMs = 0;
	abstract displayObject: DisplayObject;

	// If redefine this constructor, you must redefine the constructor of EntityClass Game.connect()
	constructor(public entityCore: EntityCore.default) {

	}

	beforeUpdate(world: WorldCore.default, tickData: ITickData) {
		this.elapseMs += tickData.deltaMs;
	}

	afterUpdate(world: WorldCore.default, tickData: ITickData) {}

	abstract onCreate(coreEntity: EntityCore.default): void;
	abstract update(world: WorldCore.default, tickData: ITickData): void;
}
