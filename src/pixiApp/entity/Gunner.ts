import * as PIXI from 'pixi.js';
import GunnerCore from '../../../../core/src/entity/Gunner';
import type World from '../../../../core/src/world/World';
import {type TickData} from '../../../../core/src/types';
import {lerp} from '../../../../core/src/util/common';
import Entity from './Entity';

export default class Gunner extends Entity {
	displayObject = PIXI.Sprite.from('images/terrorist.png');

	onInit() {
		this.displayObject.width = 80;
		this.displayObject.height = 80;
		this.displayObject.anchor.set(0.5);
	}

	update(world: World, tickData: TickData) {
		const alpha = 0.5;
		this.displayObject.position.set(
			lerp(this.displayObject.x, this.body.x, alpha),
			lerp(this.displayObject.y, this.body.y, alpha),
		);
		this.displayObject.rotation = this.body.angle;
	}
}
