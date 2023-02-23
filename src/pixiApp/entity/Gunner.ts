import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import {lerp, lerpAngle} from '@gunsurvival/core/util';
import Entity from './Entity.js';

export default class Gunner extends Entity {
	displayObject = PIXI.Sprite.from('images/terrorist.png', {
		mipmap: PIXI.MIPMAP_MODES.ON,
		multisample: 8,
	});

	onAdd() {
		this.displayObject.width = 80;
		this.displayObject.height = 80;
		this.displayObject.anchor.set(0.5);
	}

	update(world: WorldCore.default, tickData: ITickData) {
		const alpha = 0.1;
		this.displayObject.position.set(
			lerp(this.displayObject.x, this.entityCore.body.x, alpha),
			lerp(this.displayObject.y, this.entityCore.body.y, alpha),
		);
		this.displayObject.rotation = lerpAngle(this.displayObject.rotation, this.entityCore.body.angle, 0.2);
	}
}
