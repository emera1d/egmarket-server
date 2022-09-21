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

	remove(fn) {
		Object.keys(this.map)
			.forEach((iSid) => {
				const res = fn(this.map[iSid]);
				if (res) {
					delete this.map[iSid];
				}
			});
	}

	make() {
		return uuid.v4();
	}
}

module.exports.CSession = CSession;
