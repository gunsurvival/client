import {type DisplayObject} from 'pixi.js';
import type {
	World as WorldCore,
	Entity as EntityCore,
	ITickData,
} from '@gunsurvival/core';

export default abstract class Item {
	abstract displayObject: DisplayObject;

	constructor(public entityCore: EntityCore.default) {}

	useEntity(entityCore: EntityCore.default) {
		this.entityCore = entityCore;
	}

	update(world: WorldCore.default, tickData: ITickData) {}
}
