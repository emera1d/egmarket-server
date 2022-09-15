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
		const { port } = this.config;
		this.telegram = new TelegramBot(TOKEN, {
			polling: true
		});
		// this.telegram = new TelegramBot(TOKEN, {
		// 	webHook: {
		// 		port,
		// 	},
		// });

		this.bind();
	}

	bind() {
		this.telegram.on('message', this.onMessage.bind(this));
	}

	async onMessage({ from, text }) {
		const { id } = from;

		await this.telegram.sendMessage(id, text);
	
		// await telegramService.telegram.sendMessage(from.id, noMsg, {
		// 	parse_mode,
		// 	reply_markup: {
		// 	keyboard: [[{ text: msg.ihavedoneitall }]],
		// 	},
		// });
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

// https://api.telegram.org/bot{my_bot_token}/setWebhook?url={url_to_send_updates_to}
