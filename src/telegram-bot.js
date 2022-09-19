const TelegramBot = require('node-telegram-bot-api');
const { envConfig } = require('./config/env');
// import { sleep } from "../utils";

const BOT_TOKEN = envConfig.get('TELEGRAM_BOT_TOKEN');

class TelegramService {
	constructor() {
		this.events = {};
	}

	init(config) {
		// this.config = config;
	}

	on(events) {
		this.events = events || {};
	}

	start() {
		// const { port } = this.config;
		this.telegram = new TelegramBot(BOT_TOKEN, {
			polling: true
		});
		// this.telegram = new TelegramBot(TOKEN, {
		// 	webHook: {
		// 		port,
		// 	},
		// });

		this._bind();
	}

	_bind() {
		this.telegram.on('message', this.onMessage.bind(this));
	}

	async onMessage({ from, text }) {
		const { id } = from;
		console.log(`[TG] onmessage from: ${from.id} ${from.username}: ${text}`);

		if (text[0] === '/') {
			const result = await this.processCommand(text, from);

			return await this.telegram.sendMessage(id, result.message);
		} else {
			return await this.telegram.sendMessage(id, text);
		}

		// await telegramService.telegram.sendMessage(from.id, noMsg, {
		// 	parse_mode,
		// 	reply_markup: {
		// 	keyboard: [[{ text: msg.ihavedoneitall }]],
		// 	},
		// });
	}

	async sendOtp({ telegramId, otp }) {
		await this.telegram.sendMessage(telegramId, otp);
	}

	async processCommand(text, user) {
		const wsIndex = text.indexOf(' ');
		const cmd = text.substring(1, wsIndex !== -1 ? wsIindex : undefined);
		const params = wsIndex !== -1 ? text.substring(wsIndex) : '';
		let res;

		switch (cmd) {
			case 'start':
				res = await this.events.onRegistration({ telegramId: user.id, username: user.username });
				return { message: res.success ? 'Welcome to market' : 'Welcome back to market' };

			case 'reg':
				res = await this.events.onRegistration({ telegramId: user.id, username: user.username });
				return { message: res.success ? 'Registered' : res.message };

			default:
				return { message: 'Invalid comman' };
		}
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
