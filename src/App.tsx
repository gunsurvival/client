import './App.css';
import React, {useEffect} from 'react';
import Game from './pixiApp/Game';
import Gunner from './pixiApp/entity/Gunner';
import Player from '../../core/src/player/Player.World';

function App() {
	useEffect(() => {
		const game = new Game(60);
		const gunner = new Gunner();
		game.playAs(gunner);
		game.init();
		const root = document.getElementById('root')!;
		root.appendChild(game.app.view as HTMLCanvasElement);
	}, []);

	return (
		<>
		</>
	);
}

export default App;
