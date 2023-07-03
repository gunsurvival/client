import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import {store} from '../../app/store.js';
import {setHealth} from '../../slices/HealthBarSlice.js';
import type Game from '../Game.js';
import Entity from './Entity.js';

export default class Gunner extends Entity {
	entityCore: EntityCore.Gunner;
	entityServer: EntityServer.Gunner;

	displayObject = PIXI.Sprite.from('images/terrorist.png', {
		mipmap: PIXI.MIPMAP_MODES.ON,
		multisample: PIXI.MSAA_QUALITY.HIGH,
	});

	initCore(entityCore: EntityCore.Gunner) {
		super.initCore(entityCore);
		this.displayObject.width = 80;
		this.displayObject.height = 80;
		this.displayObject.anchor.set(0.5);
	}

	initServer(entityServer: EntityServer.Gunner): void {
		super.initServer(entityServer);

		entityServer.stats.listen('health', value => {
			this.entityCore._stats.health = value;
			if (this.isUser) {
				store.dispatch(setHealth(value));
			}
		});
		// EntityServer.stats.listen('radius', this.normalMutate(this.entityCore._stats, 'radius'));
		entityServer.stats.listen(
			'speed',
			this.normalMutate(this.entityCore._stats, 'speed'),
		);
	}

	update(game: Game, tickData: ITickData) {
		this.smoothTransition(0.1, 0.2);
	}
}
