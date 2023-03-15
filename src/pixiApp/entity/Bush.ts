import {type DataChange} from './../../lib/colyseus.js';
import * as PIXI from 'pixi.js';
import type * as EntityCore from '@gunsurvival/core/entity';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityServer from '@gunsurvival/server/entity';
import Entity from './Entity.js';

export default class Bush extends Entity {
	declare entityCore: EntityCore.Bush;
	displayObject = PIXI.Sprite.from('images/Bush.png');

	onAdd() {
		this.displayObject.width = 200;
		this.displayObject.height = 200;
		this.displayObject.anchor.set(0.5);
	}

	update(world: WorldCore.default, tickData: ITickData) {
		this.displayObject.x = this.entityCore.body.pos.x;
		this.displayObject.y = this.entityCore.body.pos.y;
	}

	hookStateChange(entityServer: EntityServer.default): void {
		super.hookStateChange(entityServer);

		(entityServer as EntityServer.Bush).stats.onChange = (changes: DataChange[]) => {
			changes.forEach((change: DataChange) => {
				switch (change.field) {
					case 'radius':
						this.entityCore.stats.radius = change.value as number;
						break;
					default:
						break;
				}
			});
		};
	}
}
