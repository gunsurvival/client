import './App.css';
import React, {useEffect} from 'react';
import Game from './pixiApp/Game.js';
import * as Player from '@gunsurvival/core/player';

function App() {
	useEffect(() => {
		const game = new Game(128);
		game.connect().then(() => {
			game.init();
		}).catch(err => {
			console.error(err);
		});
		const root = document.getElementById('root')!;
		root.appendChild(game.world.app.view as HTMLCanvasElement);
	}, []);

	return (
		<>
			<div id='move-zone' className='zone dynamic active w-1/2 h-full fixed bottom-0 left-0 z-10'></div>
			<div id='aim-zone' className='zone dynamic active w-1/2 h-full fixed bottom-0 right-0 z-10'></div>
		</>
	);
}

export default App;
