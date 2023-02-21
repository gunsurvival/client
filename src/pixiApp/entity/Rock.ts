import * as PIXI from 'pixi.js';
import type * as WorldCore from '@gunsurvival/core/world';
import type {ITickData} from '@gunsurvival/core/types';
import Entity from './Entity.js';

export default class Rock extends Entity {
	displayObject = PIXI.Sprite.from('images/Rock.png');

	onCreate() {
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
	}

	update(world: WorldCore.default, tickData: ITickData) {
		this.displayObject.x = this.entityCore.body.pos.x;
		this.displayObject.y = this.entityCore.body.pos.y;
	}
}
