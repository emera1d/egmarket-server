
const mapi = require('./mapi');

const sendResponse = (res, data) => {
	res.send(data);
}

const bind = (action) => {
	return async (req, res) => {
		const result = await action(req, res);
		const data = JSON.stringify(result);

		sendResponse(res, data);
	};
}

module.exports.httpStart = (config) => {
	const express = require('express');
	const bodyParser = require('body-parser');
	const router = express.Router();
	const app = express();
	
	// App use. Here we are configuring express to use body-parser as middle-ware.
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(bodyParser.raw());

	app.use((req, res, next) => {
		res.append('Access-Control-Allow-Origin', ['*']);
		res.append('Access-Control-Allow-Methods', 'GET,POST');
		res.append('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	app.post('/', bind(mapi.root));
	app.post('/mapi', bind(mapi.mapi));
	app.post('/mapi/status', bind(mapi.status));
	app.post('/mapi/list', bind(mapi.list));
	app.post('/mapi/profile/register', bind(mapi.profileregister));
	app.post('/mapi/profile/orders', bind(mapi.profileorders));
	app.post('/mapi/market/info', bind(mapi.marketinfo));
	app.post('/mapi/market/data', bind(mapi.marketdata));
	app.post('/mapi/searchforsale', bind(mapi.searchforsale));
	app.post('/mapi/placeorder', bind(mapi.placeorder));
	app.post('/mapi/revokeorder', bind(mapi.revokeorder));

	// app.use('/', router);

	app.listen(config.port, () => {
		console.log(`app.listen: ${config.port}`);
	});
};
