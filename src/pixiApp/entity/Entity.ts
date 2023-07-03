import type {DisplayObject} from 'pixi.js';
import type {ITickData} from '@gunsurvival/core/types';
import {lerp, lerpAngle} from '@gunsurvival/core/util';
import type * as EntityCore from '@gunsurvival/core/entity';
import type * as EntityServer from '@gunsurvival/server/entity';
import type Game from '../Game.js';
import getOrdering from '../ordering.js';

export default abstract class Entity {
	randomSeed = Math.random() * 1000;
	isUser = false; // If this entity is playing by the player

	abstract entityCore: EntityCore.default;
	abstract entityServer: EntityServer.default;
	abstract displayObject: DisplayObject;

	/**
	 * @description Initialize the entity client with the entity core
	 * @param entityCore Core Entity
	 */
	initCore(entityCore: EntityCore.default): void {
		this.entityCore = entityCore;

		this.displayObject.rotation = entityCore.body.angle;
		this.displayObject.x = entityCore.body.pos.x;
		this.displayObject.y = entityCore.body.pos.y;
		this.displayObject.zIndex = getOrdering(this.constructor.name);
	}

	/**
	 * @description Initialize the entity client with the entity server: Hook state changes: scale, angle, x, y
	 * @param entityServer Server Entity
	 */
	initServer(entityServer: EntityServer.default): void {
		this.entityServer = entityServer;

		entityServer.listen(
			'scale',
			this.normalMutate(this.entityCore.body, 'scale'),
		);
		entityServer.listen(
			'angle',
			this.normalMutate(this.entityCore.body, 'angle'),
		);
		entityServer.pos.listen(
			'x',
			this.normalMutate(this.entityCore.body.pos, 'x'),
		);
		entityServer.pos.listen(
			'y',
			this.normalMutate(this.entityCore.body.pos, 'y'),
		);
	}

	/**
	 * @description Update the entity's displayObject position and rotation to match the entity's body
	 * @param alphaMove
	 * @param alphaRotate
	 */
	smoothTransition(alphaMove = 1, alphaRotate = 1): void {
		this.displayObject.position.set(
			lerp(this.displayObject.x, this.entityCore.body.x, alphaMove),
			lerp(this.displayObject.y, this.entityCore.body.y, alphaMove),
		);
		this.displayObject.rotation = lerpAngle(
			this.displayObject.rotation,
			this.entityCore.body.angle,
			alphaRotate,
		);
	}

	/**
	 * @description Return function to mutate the primitive value of an object
	 * @param obj
	 * @param field
	 */
	normalMutate<K extends keyof ObjectType, ObjectType>(
		obj: ObjectType,
		field: K,
	) {
		return (value: ObjectType[K], previousValue: ObjectType[K]) => {
			obj[field] = value;
		};
	}

	abstract update(game: Game, tickData: ITickData): void;
}
