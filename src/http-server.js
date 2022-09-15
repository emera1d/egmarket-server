
const mapi = require('./mapi');

const sendResponse = (res, data) => {
	res.send(data);
}

const bind = (ref) => {
	return (req, res) => {
		const result = ref();
		const data = JSON.stringify(result);

		sendResponse(res, data);
	};
}

module.exports.httpStart = (config) => {
	const express = require('express');
	const app = express();

	app.use((req, res, next) => {
		res.append('Access-Control-Allow-Origin', ['*']);
		res.append('Access-Control-Allow-Methods', 'GET,POST');
		res.append('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	app.get('/', bind(mapi.ping));
	app.get('/mapi', bind(mapi.root));
	app.get('/mapi/status', bind(mapi.status));
	app.get('/mapi/list', bind(mapi.list));
	app.get('/mapi/placeorder', bind(mapi.placeorder));

	app.listen(config.port, () => {
		console.log(`app.listen: ${config.port}`);
	});
};

