import {Inventory as InventoryCore} from '@gunsurvival/core';

export default class Inventory {
	constructor(public inventoryCore: InventoryCore) {
		inventoryCore.on('add', (item) => {
			console.log('add', item);
		}

		inventoryCore.on('remove', (item) => {
			console.log('remove', item);
		}

		inventoryCore.on('select', (item) => {
			console.log('select', item);
		}
	}
}
