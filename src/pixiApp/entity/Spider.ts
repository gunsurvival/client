import * as PIXI from 'pixi.js';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import Mob from './Mob.js';

export default class Spider extends Mob {
	entityCore: EntityCore.Spider;
	entityServer: EntityServer.Spider;
	displayObject = PIXI.Sprite.from('images/Spider.png');

	initCore(entityCore: EntityCore.default) {
		super.initCore(entityCore);
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
	}
}
