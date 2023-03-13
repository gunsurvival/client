
import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.js';
import {store} from './app/store.js';
import {Provider} from 'react-redux';

const container: HTMLElement = document.getElementById('root')!;
const root = createRoot(container);
root.render(
	<Provider store={store}>
		<App />
	</Provider>,
);
