import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {type RootState} from '../app/store.js';
import {choose} from '../slices/ItemBarSlice.js';

function Slot({id}: {id: number}) {
	const dispatch = useDispatch();
	const {choosing} = useSelector((state: RootState) => state.itemBarSlice);
	const choosingStyle = 'bg-green-900 -translate-y-[10px] w-16 w-16';
	const notChoosingStyle = 'bg-green-800 w-14 h-14';

	return (
		<div onClick={() => {
			dispatch(choose(id));
		}} className={`border-solid z-50 mr-3 rounded-xl ${choosing === id ? choosingStyle : notChoosingStyle}`}></div>
	);
}

export default function ItemBar() {
	const slots = [];
	const {amount} = useSelector((state: RootState) => state.itemBarSlice);

	for (let i = 0; i < amount; i++) {
		slots.push({id: i});
	}

	return (
		<div className='fixed bottom-5 left-0 z-20'>
			<div className='flex bottom-2 left-0 w-screen h-16 justify-center'>
				{
					slots.map(slot => (<Slot id={slot.id} key={slot.id}/>))
				}
			</div>
		</div>
	);
}
