require('dotenv').config();

module.exports.envConfig = {
	get(key) {
		return process.env[key]
	}
};
