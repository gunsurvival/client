import * as PIXI from 'pixi.js';
import type * as WorldCore from '@gunsurvival/core/world';
import type {ITickData} from '@gunsurvival/core/types';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import Entity from './Entity.js';
import getOrdering from '../ordering.js';
import {lerp, lerpAngle} from '@gunsurvival/core';
import Mob from './Mob.js';

export default class Wolf extends Mob {
	declare entityCore: EntityCore.Wolf;
	displayObject = PIXI.Sprite.from('images/Wolf.png');

	onAdd() {
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
		this.displayObject.zIndex = getOrdering('Wolf');
	}
}
