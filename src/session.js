const uuid = require('uuid');

class CSession {

	constructor() {
		this.map = {};
	}

	get(sid) {
		return this.map[sid];
	}

	set(sid, data) {
		this.map[sid] = data;
	}

	make() {
		return uuid.v4();
	}
}

module.exports.CSession = CSession;
