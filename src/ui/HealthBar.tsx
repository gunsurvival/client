import React from 'react';

export default function HealthBar() {
	return (
		<div className='flex -translate-x-2'>
			<div className='w-14 h-14 rounded-full relative left-3 border-solid border-green-900 border-8'>
				<img src='./images/heart.png' />
			</div>
			<div className='flex flex-wrap content-center'>
				<div className='w-64 h-10 bg-green-900 rounded-lg'></div>
			</div>
		</div>
	);
}
