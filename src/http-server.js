const { time } = require('./utils');
const mapi = require('./mapi');

const sendResponse = (res, data) => {
	res.send(data);
}

const bind = (action) => {
	return async (req, res) => {
		console.log(`[${time()}] ${req.method} ${req.url}`);

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
	app.post('/mapi/market/info', bind(mapi.marketinfo));
	app.post('/mapi/market/data', bind(mapi.marketdata));
	app.post('/mapi/market/status', bind(mapi.marketstatus));
	app.post('/mapi/profiles/auth', bind(mapi.profilesauth));
	app.post('/mapi/profiles/list', bind(mapi.profileslist));
	app.post('/mapi/profiles/orders', bind(mapi.profilesorders));
	app.post('/mapi/profiles/register', bind(mapi.profilesregister));
	app.post('/mapi/orders/place', bind(mapi.ordersplace));
	app.post('/mapi/orders/revoke', bind(mapi.ordersrevoke));
	app.post('/mapi/orders/search', bind(mapi.orderssearch));

	// app.use('/', router);

	app.listen(config.port, () => {
		console.log(`app.listen: ${config.port}`);
	});
};
