import React from 'react';

export default function HealthBar() {
	return (
		<div className='flex -translate-x-2'>
			<div className='w-12 h-12 rounded-full relative left-3 border-solid border-red-600 border-8 bg-red-900 flex justify-center'>
				<img src='./images/heart.png' className='w-4/5' />
			</div>
			<div className='flex flex-wrap content-center'>
				<div className='w-48 h-7 bg-red-600 rounded-lg'></div>
			</div>
		</div>
	);
}
