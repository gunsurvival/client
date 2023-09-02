import './index.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.js';
import {store} from './app/store.js';
import {Provider} from 'react-redux';
import Game from './pixiApp/Game.js';

const container: HTMLElement = document.getElementById('root')!;
const root = createRoot(container);

root.render(
	<Provider store={store}>
		<App />
	</Provider>,
);
