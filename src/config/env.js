require('dotenv').config();

module.exports.envConfig = {
	get(key) {
		switch (key) {
			case 'TELEGRAM_BOT_TOKEN':		return process.env[key];
			case 'POSTGRES_CONNECTION_URL': return process.env[key];
			default:
				return process.env[key];
		}
	}
};
