import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import {lerp} from '@gunsurvival/core/util';
import type {World} from '@gunsurvival/core/world';
import GunnerCore from '@gunsurvival/core/entity/Gunner.js';
import Entity from './Entity.js';

export default class Gunner extends Entity {
	displayObject = PIXI.Sprite.from('images/terrorist.png');

	onInit() {
		this.displayObject.width = 80;
		this.displayObject.height = 80;
		this.displayObject.anchor.set(0.5);
	}

	update(world: World, tickData: ITickData) {
		const alpha = 0.5;
		this.displayObject.position.set(
			lerp(this.displayObject.x, this.entityCore.rigid.x, alpha),
			lerp(this.displayObject.y, this.entityCore.rigid.y, alpha),
		);
		this.displayObject.rotation = this.body.angle;
	}
}
