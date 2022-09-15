const config = {
	port: process.env.PORT || 3300
};

const httpServer = require('./src/http-server');
// const telegramBot = require('./src/telegram-bot');

// api server
httpServer.httpStart(config);

// telegram bot
// telegramBot.init(config);
// telegramBot.start();
