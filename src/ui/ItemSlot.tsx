import React from 'react';
// Import * as PIXI from 'pixi.js';
// import UI from './UI.js';

// export default class ItemSlot extends UI {
// 	alpha = 1;
// 	blurAlpha = 0.5;
// 	isChoosing = false;

// 	constructor(x: number, y: number, width: number, height: number) {
// 		super();
// 		this.name = 'ITEM_SLOT';
// 		this.x = x;
// 		this.y = y;

// 		const itemBarGraph = new PIXI.Graphics();
// 		itemBarGraph.lineStyle(2, 0xFF00FF, 1);
// 		itemBarGraph.beginFill(0xFF00BB, 0.25);
// 		itemBarGraph.drawRoundedRect(0, 0, width, height, 15);
// 		itemBarGraph.endFill();
// 		this.addChild(itemBarGraph);
// 	}

// 	choose() {
// 		if (this.isChoosing) {
// 			return;
// 		}

// 		this.isChoosing = true;
// 		this.alpha = 1;
// 		this.y -= 10;
// 	}

// 	unChoose() {
// 		if (!this.isChoosing) {
// 			return;
// 		}

// 		this.isChoosing = false;
// 		this.alpha = this.blurAlpha;
// 		this.y += 10;
// 	}
// }

export default function ItemSlot() {
	return (
		<div className='border-solid w-8 h-8'>1</div>
	);
}
