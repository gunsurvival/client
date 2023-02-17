import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type World from '@gunsurvival/core/world/World.js';
import BushCore from '@gunsurvival/core/entity/Bush.js';
import Entity from './Entity.js';

export default class Bush extends Entity {
	displayObject = PIXI.Sprite.from('images/Bush.png');

	onCreate() {
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
	}

	update(world: World, tickData: ITickData) {
		this.displayObject.x = this.entityCore.x;
		this.displayObject.y = this.entityCore.y;
	}
}
