const express = require('express');
const bodyParser = require('body-parser');
// var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');

const { httpServerConfig } = require('./config/http-server');
const { mapi } = require('./mapi');

module.exports.httpStart = () => {
	return httpServer(httpServerConfig);
	// httpServerCookies(config);
};

const httpServer = (config) => {

	// const router = express.Router();
	const app = express();

	// App use. Here we are configuring express to use body-parser as middle-ware.
	// app.use(bodyParser.urlencoded({ extended: false }));
	// app.use(bodyParser.raw());
	app.use(bodyParser.json());
	app.use(cookieParser());
	// cors
	// app.use(cors(corsOptions));
	// session
	// app.use(session(config.session));

	// cors
	app.use((req, res, next) => {
		res.append('Access-Control-Allow-Origin', config.CORS_DOMAINS);
		res.append('Access-Control-Allow-Credentials', true);
		res.append('Access-Control-Allow-Methods', 'GET,POST');
		res.append('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	app.get('/mapi/statistics', mapi.route(mapi.statistics));

	app.post('/', mapi.route(mapi.root));
	app.post('/mapi', mapi.route(mapi.mapi));
	app.post('/mapi/market/info', mapi.route('marketinfo'));
	app.post('/mapi/market/data', mapi.route('marketdata'));
	app.post('/mapi/market/status', mapi.route('marketstatus'));
	app.post('/mapi/profiles/auth', mapi.route('profilesauth'));
	app.post('/mapi/profiles/getotp', mapi.route('profilesgetotp'));
	app.post('/mapi/profiles/list', mapi.route('profileslist'));
	app.post('/mapi/profiles/login', mapi.route('profileslogin'));
	app.post('/mapi/profiles/orders', mapi.route('profilesorders', true));
	// app.post('/mapi/profiles/register', mapi.route('profilesregister'));
	app.post('/mapi/orders/place', mapi.route('ordersplace', true));
	app.post('/mapi/orders/renew', mapi.route('ordersrenew', true));
	app.post('/mapi/orders/revoke', mapi.route('ordersrevoke', true));
	app.post('/mapi/orders/search', mapi.route('orderssearch'));

	app.listen(config.port, () => {
		console.log(`app.listen: ${config.port}`);
	});

	return mapi;
};

// const httpServerCookies = (config) => {
// 	const app = express();

// 	app.use(cors(config.corsOptions));

// 	// Access the session as req.session
// 	app.get('/', function(req, res, next) {
// 	if (req.session.views) {
// 		req.session.views++
// 		res.setHeader('Content-Type', 'text/html')
// 		res.write('<p>views: ' + req.session.views + '</p>')
// 		res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
// 		res.end()
// 	} else {
// 		req.session.views = 1
// 		res.end('welcome to the session demo. refresh!')
// 	}
// 	})

// 	app.listen(config.port, () => {
// 		console.log(`app.listen: ${config.port}`);
// 	});
// };
