import * as PIXI from 'pixi.js';
import type World from '@gunsurvival/core/src/world/Casual';
import {type TickData} from '../../../../core/src/types';
import Entity from './Entity';

export default class Rock extends Entity {
	displayObject = PIXI.Sprite.from('images/Rock.png');

	onInit() {
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
	}

	update(world: World, tickData: TickData) {
		this.displayObject.x = this.coreEntity.pos.x;
		this.displayObject.y = this.coreEntity.pos.y;
	}
}
