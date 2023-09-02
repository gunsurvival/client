import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import type Game from '../Game.js';
import Entity from './Entity.js';

export default class Rock extends Entity {
	entityCore: EntityCore.Rock;
	entityServer: EntityServer.Rock;
	displayObject = PIXI.Sprite.from('images/Rock.png');

	initCore(entityCore: EntityCore.default): void {
		super.initCore(entityCore);
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
	}

	initServer(entityServer: EntityServer.Rock): void {
		super.initServer(entityServer);

		// EntityServer.stats.listen('radius', this.normalMutate(this.entityCore._stats, 'radius'));
	}

	update(game: Game, tickData: ITickData) {
		this.displayObject.scale.x = this.entityCore.body.scaleX;
		this.displayObject.scale.y = this.entityCore.body.scaleY;
		this.smoothTransition();
	}
}
