import * as PIXI from 'pixi.js';
import GunnerCore from '../../../../core/src/entity/Gunner';
import type World from '../../../../core/src/world/World';
import type IEntity from './Entity';
import {type TickData} from '../../../../core/src/types';

const lerp = (a: number, b: number, c: number) => (a * (1 - c)) + (b * c);

export default class Gunner extends GunnerCore implements IEntity {
	displayObject = PIXI.Sprite.from('images/terrorist.png');
	constructor() {
		super();
		this.displayObject.width = 80;
		this.displayObject.height = 80;
		this.displayObject.anchor.set(0.5);
	}

	update(world: World, tickData: TickData) {
		super.update(world, tickData);
		const alpha = 0.5;
		this.displayObject.x = lerp(this.displayObject.x, this.body.x, alpha);
		this.displayObject.y = lerp(this.displayObject.y, this.body.y, alpha);
		this.displayObject.rotation = this.body.angle;
		console.log(this.body.angle);
	}
}
