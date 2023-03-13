import * as PIXI from 'pixi.js';
import ItemSlot from './ItemSlot.js';
import UI from './UI.js';

export default class ItemBar extends UI<ItemSlot> {
	slotWidth: number;
	slotHeight: number;

	constructor(
		{barX, barY, slotWidth, slotHeight}: {
			barX: number;
			barY: number;
			slotWidth: number;
			slotHeight: number;
		}) {
		super();
		this.name = 'ITEM_BAR';
		this.x = barX;
		this.y = barY;
		this.slotWidth = slotWidth;
		this.slotHeight = slotHeight;

		this.anchorMode('center', 'center');

		for (let i = 0; i < 5; i++) {
			this.addItemSlot();
		}
	}

	addItemSlot() {
		const x = this.children.length * this.slotWidth + 10 * this.children.length;
		const slotItem = new ItemSlot(x, this.y, this.slotWidth, this.slotHeight);
		this.addChild(slotItem);
		this.choose(this.children.length - 1);
		this.resize();
	}

	choose(index: number) {
		this.children.forEach((item, i) => {
			if (i === index) {
				item.choose();
			} else {
				item.unChoose();
			}
		});
	}
}
