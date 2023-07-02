import type * as PIXI from 'pixi.js';
import type * as WorldCore from '@gunsurvival/core/world';
import type {ITickData} from '@gunsurvival/core/types';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import Entity from './Entity.js';
import getOrdering from '../ordering.js';
import {lerp, lerpAngle} from '@gunsurvival/core';

export default abstract class Mob extends Entity {
	declare entityCore: EntityCore.Mob;
	abstract displayObject: PIXI.Sprite;

	update(world: WorldCore.default, tickData: ITickData) {
		const alpha = 0.5;
		const bubbleScale = Math.sin(tickData.elapsedMs / 300) * 0.05;
		const scale = this.entityCore._stats.health / 100 + bubbleScale;
		this.displayObject.scale = {
			x: scale,
			y: scale,
		};
		this.displayObject.position.set(
			lerp(this.displayObject.x, this.entityCore.body.x, alpha),
			lerp(this.displayObject.y, this.entityCore.body.y, alpha),
		);
		this.displayObject.rotation = lerpAngle(this.displayObject.rotation, this.entityCore.body.angle, 0.1);
	}

	hookStateChange(entityServer: EntityServer.Mob): void {
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
