const port = 3000;
export const ENDPOINT = `${location.protocol.replace('http', 'ws')}//${
	location.hostname
}:${port}/`;
