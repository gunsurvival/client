import React from 'react';
import {useSelector} from 'react-redux';
import {type RootState} from '../app/store.js';

export default function HealthBar() {
	const {health} = useSelector((state: RootState) => state.heathBarSlice);
	const percent = health / 100;

	return (
		<div className='flex items-center -translate-x-2'>
			<div className='w-12 h-12 rounded-full relative left-3 border-solid border-red-600 border-8 bg-red-900 flex justify-center z-10'>
				<img src='./images/heart.png' className='w-4/5' />
			</div>
			<div className='relative z-9'>
				<div className='w-48 h-7 border-red-600 rounded-lg border-solid border-4 z-8'></div>
				<div className='w-48 h-7 bg-red-600 rounded-lg absolute top-0 left-0 z-7' style={{width: `${192 * percent}px`}}></div>
			</div>
		</div>
	);
}
