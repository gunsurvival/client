import {type Inventory as InventoryCore} from '@gunsurvival/core';
import {store} from '../app/store.js';
import {choose} from '../slices/ItemBarSlice.js';
import type Item from './item/Item.js';

export default class Inventory {
	constructor(public inventoryCore: InventoryCore) {
		inventoryCore.event.on('choose', indexes => {
			store.dispatch(choose(indexes));
		});
	}
}
