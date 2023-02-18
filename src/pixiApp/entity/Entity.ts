
import type {DisplayObject} from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type {World} from '@gunsurvival/core/world';
import type {Entity as EntityCore} from '@gunsurvival/core/entity';

export default abstract class Entity {
	elapseMs = 0;
	abstract displayObject: DisplayObject;

	constructor(public entityCore: EntityCore) {

	}

	beforeUpdate(world: World, tickData: ITickData) {
		this.elapseMs += tickData.deltaMs;
	}

	afterUpdate(world: World, tickData: ITickData) {}

	abstract onCreate(coreEntity: EntityCore): void;
	abstract update(world: World, tickData: ITickData): void;
}
