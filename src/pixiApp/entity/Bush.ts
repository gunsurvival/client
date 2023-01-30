import * as PIXI from 'pixi.js';
import BushCore from '../../../../core/src/entity/Bush';
import type World from '../../../../core/src/world/World';
import type IEntity from './Entity';
import {type TickData} from '../../../../core/src/types';

export default class Bush extends BushCore implements IEntity {
	displayObject = PIXI.Sprite.from('images/Bush.png');

	onCreate() {
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
	}

	update(world: World, tickData: TickData) {
		super.update(world, tickData);
		this.displayObject.x = this.body.x;
		this.displayObject.y = this.body.y;
	}
}
