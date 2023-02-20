import './App.css';
import React, {useEffect} from 'react';
import Game from './pixiApp/Game.js';
import * as Player from '@gunsurvival/core/player';

function App() {
	useEffect(() => {
		const game = new Game(60);
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
		</>
	);
}

export default App;
