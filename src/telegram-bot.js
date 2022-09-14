const TelegramBot = require('node-telegram-bot-api');
// import { sleep } from "../utils";
// import { config } from '../config';

// require("dotenv").config();

const TOKEN = '5735045515:AAF1wloyCrB1X3giSWwKaEY_SqUDiWdSO1U';

class TelegramService {
	constructor() {
	}

	init(config) {
		this.config = config;
	}

	start() {
		// const token = config.get().BOT_TOKEN;
		// this.telegram = new TelegramBot(TOKEN, { polling: true });

		const { port } = this.config;
		this.telegram = new TelegramBot(TOKEN, {
			webHook: {
				port: port,
			},
		});

		this.bind();
	}

	bind() {
		this.telegram.on('message', async ({ from, text }) => {
			console.log(from.id, from.username);
		
			await telegramService.telegram.sendMessage(userId, text);
		
			// await telegramService.telegram.sendMessage(from.id, noMsg, {
			// 	parse_mode,
			// 	reply_markup: {
			// 	keyboard: [[{ text: msg.ihavedoneitall }]],
			// 	},
			// });
		
		});
	}

	// sendChanelMessageWithDelay = async (id: string, msg: string) => {
	// 	try {
	// 		await this.telegram.sendMessage(id, msg, { parse_mode: "Markdown" });
	// 		await sleep(2000);
	// 	} catch (e) {
	// 		console.log(`❌ failed to send message to the group ${id}`);
	// 	}
	// };
}

module.exports = new TelegramService();
