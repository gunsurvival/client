import * as PIXI from 'pixi.js';
import Entity from './Entity';
import BushCore from '../../../../core/src/entity/Bush';
import type World from '../../../../core/src/world/World';
import {type TickData} from '../../../../core/src/types';

export default class Bush extends Entity {
	displayObject = PIXI.Sprite.from('images/Bush.png');

	onInit() {
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
	}

	update(world: World, tickData: TickData) {
		this.displayObject.x = this.coreEntity.x;
		this.displayObject.y = this.coreEntity.y;
	}
}
