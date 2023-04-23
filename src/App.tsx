import './App.css';
import React, {useEffect} from 'react';
import type Game from './pixiApp/Game.js';
import ItemSlot from './ui/ItemBar.js';
import HealthBar from './ui/HealthBar.js';

function App() {
	return (
		<div className='fixed top-0 left-0 w-screen h-screen z-50'>
			<div id='move-zone' className='zone dynamic active w-1/2 h-full absolute bottom-0 left-0'></div>
			<div id='aim-zone' className='zone dynamic active w-1/2 h-full absolute bottom-0 right-0'></div>
			<ItemSlot/>
			<div className='w-screen absolute bottom-28'>
				<div className='justify-center flex'>
					<HealthBar/>
				</div>
			</div>
		</div>
	);
}

export default App;
