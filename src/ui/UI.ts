import * as PIXI from 'pixi.js';

export default class UI<T extends PIXI.DisplayObject = PIXI.DisplayObject> extends PIXI.Container<T> {
	anchorX: 'left' | 'center' | 'right' = 'left';
	anchorY: 'top' | 'center' | 'bottom' = 'top';
	alignBound = {
		width: 0,
		height: 0,
	};

	resize() { // Call this after changing the size of the UI or resizing the window
		this.pivot.x = this.anchorX === 'center' ? this.width / 2 : this.anchorX === 'right' ? this.width : 0;
		this.pivot.y = this.anchorY === 'center' ? this.height / 2 : this.anchorY === 'bottom' ? this.height : 0;
	}

	anchorMode(anchorX: 'left' | 'center' | 'right', anchorY: 'top' | 'center' | 'bottom' = this.anchorY) {
		this.anchorX = anchorX;
		this.anchorY = anchorY;
		this.resize();
	}

	alignMode(alignBound: {width: number; height: number}, mode: 'left' | 'center' | 'right' = 'center') {
		this.alignBound = alignBound;
		this.resize();
	}
}
