import type {DisplayObject} from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';
import {lerp} from '@gunsurvival/core/util';
import type * as EntityServer from '@gunsurvival/server/entity';
import type {EntityStats} from '@gunsurvival/core/stats';
import {type DataChange} from '../../lib/colyseus.js';
import Weapon from '../Weapon.js';

export default abstract class Entity {
	isUser = false; // If this entity is playing by the player
	abstract displayObject: DisplayObject;

	constructor(public entityCore: EntityCore.default) {}

	useEntity(entityCore: EntityCore.default) {
		this.entityCore = entityCore;
	}

	update(world: WorldCore.default, tickData: ITickData) {}
	onAdd(coreEntity: EntityCore.default) {}
	onRemove(coreEntity: EntityCore.default) {}

	hookStateChange(entityServer: EntityServer.default) {
		// Scale, Angle
		const normalMutate = (obj: any, field: string) => (value: any, previousValue: any) => {
			if (field in this.entityCore.body) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				obj[field] = value;
			}
		};

		entityServer.listen('scale', normalMutate(this.entityCore.body, 'scale'));
		entityServer.listen('angle', normalMutate(this.entityCore.body, 'angle'));
		entityServer.listen('stats', normalMutate(this.entityCore, 'stats'));
		entityServer.pos.listen('x', normalMutate(this.entityCore.body.pos, 'x'));
		entityServer.pos.listen('y', normalMutate(this.entityCore.body.pos, 'y'));
	}
}
