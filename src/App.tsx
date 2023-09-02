import './App.css';
import React, {createContext, useEffect} from 'react';
import Game from './pixiApp/Game.js';
import ItemSlot from './ui/ItemBar.js';
import HealthBar from './ui/HealthBar.js';

const game = new Game(128);
game.connect().then(() => {
	game.init();
	const gameRoot = document.getElementById('gameRoot')!;
	gameRoot.parentNode?.replaceChild(game.app.view as HTMLCanvasElement, gameRoot);
}).catch(console.error);

export const GameContext = createContext<{game: Game}>({game});

function App() {
	return (
		<GameContext.Provider value={{game}}>
			<div className='fixed top-0 left-0 w-screen h-screen z-50'>
				<div id='gameRoot'></div>
				<div
					id='move-zone'
					className='zone dynamic active w-1/2 h-full absolute bottom-0 left-0'
				></div>
				<div
					id='aim-zone'
					className='zone dynamic active w-1/2 h-full absolute bottom-0 right-0'
				></div>
				<ItemSlot />
				<div className='w-screen absolute bottom-28'>
					<div className='justify-center flex'>
						<HealthBar />
					</div>
				</div>
			</div>
		</GameContext.Provider>
	);
}

export default App;
