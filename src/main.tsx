
import './index.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.js';
import {store} from './app/store.js';
import {Provider} from 'react-redux';
import Game from './pixiApp/Game.js';

const container: HTMLElement = document.getElementById('root')!;
const root = createRoot(container);

document.addEventListener('DOMContentLoaded', async () => {
	try {
		globalThis.game = new Game(128);
		await game.connect();
		game.init();
		const root = document.getElementById('root')!;
		root.appendChild(game.app.view as HTMLCanvasElement);
	} catch (err) {
		console.error(err);
	}
});

root.render(
	<Provider store={store}>
		<App/>
	</Provider>,
);
