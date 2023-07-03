import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import type Game from '../Game.js';
import Entity from './Entity.js';

export default class Bush extends Entity {
	entityCore: EntityCore.Bush;
	entityServer: EntityServer.Bush;
	displayObject = PIXI.Sprite.from('images/Bush.png');

	initCore(entityCore: EntityCore.Bush): void {
		super.initCore(entityCore);
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);

		entityCore.event.on('collision-enter', other => {
			if (other instanceof EntityCore.Gunner) {
				this.displayObject.alpha = 0.4;
			}
		});

		entityCore.event.on('collision-exit', other => {
			if (other instanceof EntityCore.Gunner) {
				this.displayObject.alpha = 1;
			}
		});
	}

	initServer(entityServer: EntityServer.Bush): void {
		super.initServer(entityServer);
	}

	update(game: Game, tickData: ITickData) {
		this.smoothTransition();
	}
}
