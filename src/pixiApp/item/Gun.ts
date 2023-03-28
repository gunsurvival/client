import {type DisplayObject} from '@pixi/display';
import Item from './Item.js';

export default abstract class Gun extends Item {
	abstract displayObject: DisplayObject;
}
