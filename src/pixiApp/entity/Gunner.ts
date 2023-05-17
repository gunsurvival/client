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
import getOrdering from '../ordering.js';

export default class Gunner extends Entity {
	declare entityCore: EntityCore.Gunner;

	displayObject = PIXI.Sprite.from('images/terrorist.png', {
		mipmap: PIXI.MIPMAP_MODES.ON,
		multisample: PIXI.MSAA_QUALITY.HIGH,
	});

	onAdd() {
		this.displayObject.width = 80;
		this.displayObject.height = 80;
		this.displayObject.anchor.set(0.5);
		this.displayObject.zIndex = getOrdering('Gunner');
	}

	update(world: WorldCore.default, tickData: ITickData) {
		const alpha = 0.1;
		this.displayObject.position.set(
			lerp(this.displayObject.x, this.entityCore.body.x, alpha),
			lerp(this.displayObject.y, this.entityCore.body.y, alpha),
		);
		this.displayObject.rotation = lerpAngle(this.displayObject.rotation, this.entityCore.body.angle, 0.2);
	}

	hookStateChange(entityServer: EntityServer.Gunner): void {
		super.hookStateChange(entityServer);

		const normalMutate = (obj: any, field: string) => (value: any, previousValue: any) => {
			if (field in this.entityCore.body) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				obj[field] = value;
			}
		};

		entityServer.stats.listen('health', (value, previousValue) => {
			this.entityCore._stats.health = value;
			if (this.isUser) {
				store.dispatch(setHealth(value));
			}
		});
		entityServer.stats.listen('radius', normalMutate(this.entityCore._stats, 'radius'));
		entityServer.stats.listen('speed', normalMutate(this.entityCore._stats, 'speed'));
	}
}
