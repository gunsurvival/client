import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import Entity from './Entity.js';
import {type DataChange} from '../../lib/colyseus.js';

export default class Bullet extends Entity {
	declare entityCore: EntityCore.Bullet;
	displayObject = PIXI.Sprite.from('images/Bullet.png');

	onAdd() {
		this.displayObject.width = 20;
		this.displayObject.height = 20;
		this.displayObject.anchor.set(0.5);
	}

	update(world: WorldCore.default, tickData: ITickData) {
		const angle = Math.atan2((this.entityCore).vel.y, (this.entityCore).vel.x);
		this.displayObject.rotation = angle;
		this.displayObject.x = this.entityCore.body.pos.x;
		this.displayObject.y = this.entityCore.body.pos.y;
	}

	hookStateChange(entityServer: EntityServer.default): void {
		super.hookStateChange(entityServer);

		(entityServer as EntityServer.Bullet).vel.onChange = (changes: DataChange[]) => {
			changes.forEach((change: DataChange) => {
				if (this.isPlayer) {
					return;
				}

				switch (change.field) {
					case 'x':
						this.entityCore.vel.x = change.value as number;
						break;
					case 'y':
						this.entityCore.vel.y = change.value as number;
						break;
					default:
						break;
				}
			});
		};
	}
}
