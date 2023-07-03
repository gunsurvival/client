import type {
	World as WorldCore,
	Entity as EntityCore,
	ITickData,
} from '@gunsurvival/core';
import * as PIXI from 'pixi.js';
import Gun from './Gun.js';

export default class Ak47 extends Gun {
	displayObject = PIXI.Sprite.from('images/Ak47.png');

	constructor(entityCore: EntityCore.default) {
		super(entityCore);
		// This.displayObject.width = 100;
		// this.displayObject.height = 100;
		this.displayObject.anchor.set(0.5);
	}

	update(world: WorldCore.default, tickData: ITickData) {
		this.displayObject.rotation = this.entityCore.body.angle;
	}
}
