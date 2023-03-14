import React from 'react';

export default function HealthBar() {
	return (
		<div className='fixed justify-center z-50 bottom-10 left-10'>
			<div className='flex'>
				<div className='w-10 h-10 rounded-full bg-red-900'></div>
				<div className='flex flex-wrap content-center'>
					<div className='w-16 h-5 bg-green-900'></div>
				</div>
			</div>
		</div>
	);
}
