import React, {useEffect} from 'react';
import './App.css';
import Game from './pixiApp/Game';
import Gunner from './pixiApp/entity/Gunner';
import player from '../../core/src/entity/Player';

function App() {
	useEffect(() => {
		const game = new Game(60);
		game.player = new (player(Gunner))();
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
