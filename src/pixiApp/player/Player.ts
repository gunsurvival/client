import type * as PIXI from 'pixi.js';
import {type ITickData, type Player as PlayerCore} from '@gunsurvival/core';
import type Game from '../Game.js';

export default abstract class Player {
	abstract playerCore: PlayerCore.default;
	abstract displayObject: PIXI.DisplayObject;

	get isReady() {
		return this.playerCore && this.playerCore.isReady;
	}

	update(game: Game, tickData: ITickData) {
		this.playerCore.update(game.worldCore, tickData);
	}
}
