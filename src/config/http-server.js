const CORS_DOMAINS = [
	// 'http://localhost:3000',
	// 'http://192.168.1.178:3000',
	'https://egmarket.pages.dev',
];

// var corsOptions = {
// 	origin: 'http://localhost:3000',
// 	credentials: true,
// 	// optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// const session = {
// 	name: 'ewg_market.sid',
// 	secret: 'ewg_market_session_secret',
// 	resave: false,
// 	saveUninitialized: true,
// 	cookie: {
// 		domain: 'http://localhost:3000',
// 		secure: true,
// 		maxAge: 1 *60 *60 *1000,
// 	}
// };

// const session_test = {
// 	name: 'ewg_market.sid',
// 	secret: 'keyboard cat', 
// 	resave: false,
// 	saveUninitialized: true,
// 	cookie: { maxAge: 60000 }
// };

const httpServerConfig = {
	port: process.env.PORT || 3300,

	CORS_DOMAINS,
	corsOptions,
	// session,
};

module.exports.httpServerConfig = httpServerConfig;
