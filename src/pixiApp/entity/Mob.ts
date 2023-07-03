import type {ITickData} from '@gunsurvival/core/types';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import type Game from '../Game.js';
import Entity from './Entity.js';

export default abstract class Mob extends Entity {
	abstract entityCore: EntityCore.Mob;
	abstract entityServer: EntityServer.Mob;

	initServer(entityServer: EntityServer.Mob): void {
		super.initServer(entityServer);

		// EntityServer.stats.listen('radius', this.normalMutate(this.entityCore._stats, 'radius'));
	}

	update(game: Game, tickData: ITickData) {
		const bubbleScale
			= Math.sin((tickData.elapsedMs + this.randomSeed) / 300) * 0.05;
		const scale = this.entityCore._stats.health / 100 + bubbleScale;
		this.displayObject.scale.x = scale;
		this.displayObject.scale.y = scale;
		this.smoothTransition(0.5, 0.1);
	}
}
