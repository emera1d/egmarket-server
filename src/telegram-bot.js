const TelegramBot = require('node-telegram-bot-api');
const { envConfig } = require('./config/env');

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

			// return await this.telegram.sendMessage(id, result.message);
		} else {
			// return await this.telegram.sendMessage(id, text);
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
		let msg;

		switch (cmd) {
			case 'start':
				res = await this.events.onStart({ telegramId: user.id, username: user.username });
				msg = { message: res.success ? 'Добро пожаловать на рынок' : 'Добро пожаловать' };
				await this.telegram.sendMessage(user.id, msg.message, {
					reply_markup: {
						inline_keyboard: [[{
							text: 'Открыть рынок',
							web_app: { url: 'https://egmarket.pages.dev' }
						}]]
					}
				});
				return 

			case 'reg':
				res = await this.events.onStart({ telegramId: user.id, username: user.username });
				msg = { message: res.success ? 'Регистрация завершена' : res.message };
				await this.telegram.sendMessage(user.id, msg.message);
				return;

			case 'btnpwa':
				res = await this.events.onRegistration({ telegramId: user.id, username: user.username });
				msg = { message: res.success ? 'Registered' : res.message };
				// await this.telegram.sendMessage(user.id, 'btnpwa', {
				// 	reply_markup: {
				// 		inline_keyboard: [[{
				// 			text: 'Открыть рынок',
				// 			web_app: { url: 'https://egmarket.pages.dev' }
				// 		}]]
				// 	}
				// });
				return;
			// case 'code':
			// 	this.telegram.sendMessage(user.id, 'Share:', {
			// 		reply_markup: {
			// 			inline_keyboard: [[{
			// 				text: 'Share with your friends',
			// 				switch_inline_query: 'share'
			// 			}]]
			// 		}
			// 	});
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
