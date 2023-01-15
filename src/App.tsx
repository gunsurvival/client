import React, {useEffect, useState} from 'react';
import './App.css';
import createPixiApp from './pixiApp/app';

function App() {
	const [count, setCount] = useState(0);

	useEffect(() => {
		const app = createPixiApp(60);
		const root = document.getElementById('root')!;
		root.appendChild(app.view as HTMLCanvasElement);
	}, []);

	return (
		<>
		</>
	);
}

export default App;
