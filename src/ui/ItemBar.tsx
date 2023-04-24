import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {to} from '@gunsurvival/core/util';
import {type RootState} from '../app/store.js';
import {type IItem, choose} from '../slices/ItemBarSlice.js';

function Slot({index, item}: {index: number; item: IItem}) {
	const dispatch = useDispatch();
	const {choosing} = useSelector((state: RootState) => state.itemBarSlice);
	const choosingStyle = 'bg-green-900 -translate-y-[10px] w-16 w-16';
	const notChoosingStyle = 'bg-green-800 w-14 h-14';

	const clickHandler = async () => {
		await to(game.player.inventory.choose(index));
		dispatch(choose([index]));
	};

	return (
		<div onClick={clickHandler} className={`cursor-pointer flex items-center justify-center border-solid z-50 mr-3 rounded-xl ${choosing.includes(index) ? choosingStyle : notChoosingStyle}`}>
			<img src={`images/${item.id}.png`} className='w-4/5'></img>
		</div>
	);
}

export default function ItemBar() {
	const {items} = useSelector((state: RootState) => state.itemBarSlice);

	return (
		<div className='fixed bottom-5 left-0 z-20'>
			<div className='flex bottom-2 left-0 w-screen h-16 justify-center'>
				{
					items.map((item, index) => (<Slot item={item} index={index} key={index}/>))
				}
			</div>
		</div>
	);
}
