// Const port = location.port ? ':' + window.location.port : '';
const port = 3000;
export const ENDPOINT = `${location.protocol.replace('http', 'ws')}//${location.hostname}:${port}/`;
console.log(ENDPOINT);
