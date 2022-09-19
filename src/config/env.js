require('dotenv').config();

module.exports.envConfig = {
	get(key) {
		console.log(key, process.env[key]);
		switch (key) {
			case 'TELEGRAM_BOT_TOKEN':
				return process.env[key];
			default:
				return process.env[key];
		}
	}
};
