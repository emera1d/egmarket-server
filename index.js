const express = require('express');
const app = express();
const config = {
	port: 3300
};

app.get('/', (req, res) => {
	res.send('welcome to express');
});

app.listen(config.port, () => {
	console.log(`app.listen: ${config.port}`);
});
