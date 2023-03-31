import {type Inventory as InventoryCore} from '@gunsurvival/core';
import {store} from '../app/store.js';
import {choose} from '../slices/ItemBarSlice.js';
import type Item from './item/Item.js';

export default class Inventory {
	constructor(public inventoryCore: InventoryCore) {
		inventoryCore.event.on('add', (item: Item) => {
			console.log('add', item);
		});

		inventoryCore.event.on('remove', item => {
			console.log('remove', item);
		});

		inventoryCore.event.on('choose', item => {
			store.dispatch(choose(inventoryCore.items.indexOf(item)));
		});
	}
}
