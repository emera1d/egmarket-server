module.exports.httpStart = (config) => {
	const express = require('express');
	const app = express();


	app.get('/mapi', (req, res) => {
		res.send('welcome to express');
	});

	app.listen(config.port, () => {
		console.log(`app.listen: ${config.port}`);
	});
};