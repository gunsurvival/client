import {type DisplayObject} from 'pixi.js';
import type CoreEntity from '../../../../core/src/entity/Entity';
import type World from '../../../../core/src/world/World';
import {type TickData} from '../../../../core/src/types';

export default abstract class Entity {
	elapseMs = 0;
	abstract displayObject: DisplayObject;

	constructor(public coreEntity: CoreEntity) {

	}

	baseUpdate(world: World, tickData: TickData) {
		this.elapseMs += tickData.deltaMs;
	}

	finalUpdate(world: World, tickData: TickData) {}

	abstract onInit(): void;
	abstract update(world: World, tickData: TickData): void;
}
