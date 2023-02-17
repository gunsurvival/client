import './App.css';
import React, {useEffect} from 'react';
import Game from './pixiApp/Game';

function App() {
	useEffect(() => {
		const game = new Game(60);
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
