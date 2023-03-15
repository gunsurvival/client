import {type DataChange} from './../../lib/colyseus.js';
import * as PIXI from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';
import {lerp, lerpAngle} from '@gunsurvival/core/util';
import type * as EntityServer from '@gunsurvival/server/entity';
import Entity from './Entity.js';
import {store} from '../../app/store.js';
import {setHealth} from '../../slices/HealthBarSlice.js';

export default class Gunner extends Entity {
	declare entityCore: EntityCore.Gunner;

	displayObject = PIXI.Sprite.from('images/terrorist.png', {
		mipmap: PIXI.MIPMAP_MODES.ON,
		multisample: 8,
	});

	onAdd() {
		this.displayObject.width = 80;
		this.displayObject.height = 80;
		this.displayObject.anchor.set(0.5);
	}

	update(world: WorldCore.default, tickData: ITickData) {
		const alpha = 0.1;
		this.displayObject.position.set(
			lerp(this.displayObject.x, this.entityCore.body.x, alpha),
			lerp(this.displayObject.y, this.entityCore.body.y, alpha),
		);
		this.displayObject.rotation = lerpAngle(this.displayObject.rotation, this.entityCore.body.angle, 0.2);
	}

	hookStateChange(entityServer: EntityServer.default): void {
		super.hookStateChange(entityServer);

		(entityServer as EntityServer.Gunner).stats.onChange = (changes: DataChange[]) => {
			changes.forEach((change: DataChange) => {
				switch (change.field) {
					case 'health':
						this.entityCore.stats.health = change.value as number;
						store.dispatch(setHealth(change.value as number));
						break;
					case 'radius':
						this.entityCore.stats.radius = change.value as number;
						break;
					case 'speed':
						this.entityCore.stats.speed = change.value as number;
						break;
					default:
						break;
				}
			});
		};
	}
}
