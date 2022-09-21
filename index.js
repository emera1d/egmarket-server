const httpServer = require('./src/http-server');
const telegramBot = require('./src/telegram-bot');

// api server
const mapi = httpServer.httpStart();
mapi.on({
	onGetOtp: async (params) => await telegramBot.sendOtp(params),
});

// telegram bot
telegramBot.init();
telegramBot.on({
	onStart: async (params) => await mapi.profileRegister(params),
});

telegramBot.start();
