import * as PIXI from 'pixi.js';
import type * as Item from './item/index.js';
import {type Entity as EntityCore} from '@gunsurvival/core';

export default class Weapon {
	item: Item.default;
	items: Record<keyof typeof Item, Item.default>;

	constructor(public entityCore: EntityCore.default) {
		entityCore;
	}

	change(itemId: string) {
		this.item = item;
		console.log(this.items.Ak47);
	}

	get displayObject() {
		return this.item.displayObject || PIXI.Sprite.from('assets/weapon/None.png');
	}
}
