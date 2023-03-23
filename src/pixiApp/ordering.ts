export const zIndex = [
	'Bullet',
	'Gunner',
	'Bush',
	'Rock',
	'Explosion',
	'Particle',
	'Player',
	'UI',
	'Cursor',
];

export default function getOrdering(name: string) {
	const index = zIndex.indexOf(name);
	return index === -1 ? 0 : index;
}
