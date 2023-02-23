import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';
import Entity from './Entity.js';

export default class Bullet extends Entity {
	displayObject = PIXI.Sprite.from('images/Bullet.png');

	onAdd() {
		this.displayObject.width = 20;
		this.displayObject.height = 20;
		this.displayObject.anchor.set(0.5);
	}

	update(world: WorldCore.default, tickData: ITickData) {
		const angle = Math.atan2((this.entityCore as EntityCore.Bullet).vel.y, (this.entityCore as EntityCore.Bullet).vel.x);
		this.displayObject.rotation = angle;
		this.displayObject.x = this.entityCore.body.pos.x;
		this.displayObject.y = this.entityCore.body.pos.y;
	}
}
