import {lerp} from '@gunsurvival/core';
import {SATVector} from 'detect-collisions';
import type World from '../world/World.js';

export class Camera {
	pos = new SATVector(0, 0);
	angle = 0;
	followingPos = new SATVector(0, 0);

	constructor(public world: World) {}

	get x() {
		return this.pos.x;
	}

	get y() {
		return this.pos.y;
	}

	follow(pos: SATVector) {
		this.followingPos = pos;
	}

	update() {
		this.pos.x = ((-this.followingPos.x * this.world.viewport.scale._x) + (window.innerWidth / 2));
		this.pos.y = ((-this.followingPos.y * this.world.viewport.scale._y) + (window.innerHeight / 2));
		this.world.viewport.position.set(lerp(this.world.viewport.position.x, this.pos.x, 0.03), lerp(this.world.viewport.position.y, this.pos.y, 0.03));
	}

	shake(amount: number) {
		this.world.viewport.position.set(
			this.world.viewport.position.x + (Math.random() * amount - amount / 2),
			this.world.viewport.position.y + (Math.random() * amount - amount / 2),
		);
	}
}
