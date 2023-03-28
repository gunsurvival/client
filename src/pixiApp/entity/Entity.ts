import type {DisplayObject} from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import type * as WorldCore from '@gunsurvival/core/world';
import type * as EntityCore from '@gunsurvival/core/entity';
import {lerp} from '@gunsurvival/core/util';
import type * as EntityServer from '@gunsurvival/server/entity';
import {type DataChange} from '../../lib/colyseus.js';

export default abstract class Entity {
	isPlayer = false; // If this entity is playing by the player
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
		entityServer.onChange = (changes: DataChange[]) => {
			changes.forEach((change: DataChange) => {
				if (this.isPlayer) {
					return;
				}

				switch (change.field) {
					case 'scale':
						this.entityCore.body.scale = change.value as number;
						break;
					case 'angle':
						this.entityCore.body.angle = change.value as number;
						break;
					default:
						break;
				}
			});
		};

		// Stats
		entityServer.stats.onChange = (changes: DataChange[]) => {
			changes.forEach((change: DataChange) => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this.entityCore[change.field] = change.value;
			});
		};

		// Position
		entityServer.pos.onChange = (changes: DataChange[]) => {
			changes.forEach((change: DataChange) => {
				// If (this.isPlayer) {
				// 	switch (change.field) {
				// 		case 'x':
				// 			this.entityCore.body.pos.x = lerp(
				// 				this.entityCore.body.pos.x,
				// 				change.value as number,
				// 				0.01,
				// 			);
				// 			break;
				// 		case 'y':
				// 			this.entityCore.body.pos.y = lerp(
				// 				this.entityCore.body.pos.y,
				// 				change.value as number,
				// 				0.01,
				// 			);
				// 			break;
				// 		default:
				// 			break;
				// 	}
				// } else {
				switch (change.field) {
					case 'x':
						this.entityCore.body.pos.x = change.value as number;
						break;
					case 'y':
						this.entityCore.body.pos.y = change.value as number;
						break;
					default:
						break;
				}
				// }
			});
		};

		// Offset
		entityServer.offset.onChange = (changes: DataChange[]) => {
			changes.forEach((change: DataChange) => {
				switch (change.field) {
					case 'x':
						this.entityCore.body.offset.x = change.value as number;
						break;
					case 'y':
						this.entityCore.body.offset.y = change.value as number;
						break;
					default:
						break;
				}
			});
		};
	}
}
