import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import type Game from '../Game.js';
import Entity from './Entity.js';

export default class Bullet extends Entity {
	entityCore: EntityCore.Bullet;
	entityServer: EntityServer.Bullet;
	displayObject = PIXI.Sprite.from('images/bullet2.png');

	initCore(entityCore: EntityCore.Bullet): void {
		super.initCore(entityCore);
		this.displayObject.width = entityCore.stats.radius;
		this.displayObject.height = entityCore.stats.radius;
		this.displayObject.anchor.set(0.5);
	}

	initServer(entityServer: EntityServer.Bullet): void {
		super.initServer(entityServer);
	}

	update(game: Game, tickData: ITickData): void {
		this.smoothTransition(0.5, 0.5);
	}
}
