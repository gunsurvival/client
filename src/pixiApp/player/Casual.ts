import * as PIXI from 'pixi.js';
import Player from './Player.js';
import {type ITickData, Player as PlayerCore, Entity as EntityCore} from '@gunsurvival/core';
import type Game from '../Game.js';

export default class Casual extends Player {
	playerCore = new PlayerCore.Casual();
	displayObject = new PIXI.Container();
	visibility = new PIXI.Graphics();

	initCore(playerCore: PlayerCore.Casual) {
		this.playerCore = playerCore;
		this.displayObject.addChild(this.visibility);
	}

	update(game: Game, tickData: ITickData): void {
		super.update(game, tickData);
		// This.visibility.clear();
		// this.visibility.beginFill('white');

		// if (this.playerCore.entity instanceof EntityCore.Gunner) {
		// 	this.visibility.drawPolygon(this.playerCore.visibility.map(([x, y]) => ({x, y})));
		// }

		// this.visibility.endFill();
	}
}
