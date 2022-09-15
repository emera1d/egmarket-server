
const mapi = require('./mapi');

const sendResponse = (res, data) => {
	res.send(data);
}

module.exports.httpStart = (config) => {
	const express = require('express');
	const app = express();

	app.use((req, res, next) => {
		res.append('Access-Control-Allow-Origin', ['localhost:3000']);
		res.append('Access-Control-Allow-Methods', 'GET,POST');
		res.append('Access-Control-Allow-Headers', 'Content-Type');

		next();
	});

	app.get('/', (req, res) => {
		const result = mapi.ping();
		const data = JSON.stringify(result);

		sendResponse(res, data);
	});

	app.get('/mapi', (req, res) => {
		const result = mapi.root();
		const data = JSON.stringify(result);

		sendResponse(res, data);
	});

	app.listen(config.port, () => {
		console.log(`app.listen: ${config.port}`);
	});
};
