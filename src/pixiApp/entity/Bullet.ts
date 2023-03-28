import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import Entity from './Entity.js';
import {type DataChange} from '../../lib/colyseus.js';
import {lerp, lerpAngle} from '@gunsurvival/core';
import getOrdering from '../ordering.js';

export default class Bullet extends Entity {
	declare entityCore: EntityCore.Bullet;
	displayObject = PIXI.Sprite.from('images/bullet2.png');

	onAdd() {
		this.displayObject.width = this.entityCore.stats.radius;
		this.displayObject.height = this.entityCore.stats.radius;
		this.displayObject.anchor.set(0.5);
		this.displayObject.rotation = this.entityCore.body.angle;
		this.displayObject.x = this.entityCore.body.pos.x;
		this.displayObject.y = this.entityCore.body.pos.y;
		this.displayObject.zIndex = getOrdering('Bullet');
	}

	update(world: WorldCore.default, tickData: ITickData) {
		const alpha = 0.5;
		this.displayObject.position.set(
			lerp(this.displayObject.x, this.entityCore.body.x, alpha),
			lerp(this.displayObject.y, this.entityCore.body.y, alpha),
		);
		this.displayObject.rotation = lerpAngle(this.displayObject.rotation, this.entityCore.body.angle, 0.5);
	}

	// Call when entityServer is created
	hookStateChange(entityServer: EntityServer.default): void {
		super.hookStateChange(entityServer);

		// (entityServer as EntityServer.Bullet).vel.onChange = (changes: DataChange[]) => {
		// 	changes.forEach((change: DataChange) => {
		// 		if (this.isPlayer) {
		// 			return;
		// 		}

		// 		switch (change.field) {
		// 			case 'x':
		// 				this.entityCore.vel.x = change.value as number;
		// 				break;
		// 			case 'y':
		// 				this.entityCore.vel.y = change.value as number;
		// 				break;
		// 			default:
		// 				break;
		// 		}
		// 	});
		// };

		(entityServer as EntityServer.Bullet).stats.onChange = (changes: DataChange[]) => {
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
