const config = {
	port: process.env.PORT || 3300
};

const httpServer = require('./src/http-server');
const telegramBot = require('./src/telegram-bot');

// httpServer.httpStart(config);
telegramBot.init(config);
telegramBot.start();
