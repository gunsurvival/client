import {type DataChange} from './../../lib/colyseus.js';
import * as PIXI from 'pixi.js';
import type * as EntityCore from '@gunsurvival/core/entity';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityServer from '@gunsurvival/server/entity';
import Entity from './Entity.js';
import getOrdering from '../ordering.js';

export default class Bush extends Entity {
	declare entityCore: EntityCore.Bush;
	displayObject = PIXI.Sprite.from('images/Bush.png');

	onAdd() {
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
		this.displayObject.zIndex = getOrdering('Bush');

		this.entityCore.event.on('collision-enter', (other: EntityCore.default) => {
			if (other.constructor.name === 'Gunner') {
				this.displayObject.alpha = 0.4;
			}
		});

		this.entityCore.event.on('collision-exit', (other: EntityCore.default) => {
			if (other.constructor.name === 'Gunner') {
				this.displayObject.alpha = 1;
			}
		});
	}

	update(world: WorldCore.default, tickData: ITickData) {
		this.displayObject.x = this.entityCore.body.pos.x;
		this.displayObject.y = this.entityCore.body.pos.y;
	}

	hookStateChange(entityServer: EntityServer.Bush): void {
		super.hookStateChange(entityServer);

		const normalMutate = (obj: any, field: string) => (value: any, previousValue: any) => {
			if (field in this.entityCore.body) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				obj[field] = value;
			}
		};

		entityServer.stats.listen('radius', normalMutate(this.entityCore._stats, 'radius'));
	}
}
