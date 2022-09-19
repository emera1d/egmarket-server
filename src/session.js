const uuid = require('uuid');

class CSession {

	constructor() {
		this.map = {};
	}

	add(data) {
		const sid = uuid.v4();
		this.map[sid] = data;

		return sid;
	}

	set(sid, data) {
		if (this.map[sid]) {
			this.map[sid] = Object.assign({}, this.map[sid], data);
		} 
	}

	get(sid) {
		return this.map[sid];
	}

	remove(sid) {
		delete this.map[sid];
	}

	has(sid) {
		return this.map.hasOwnProperty(sid);
	}

	find(fn) {
		const sid = Object.keys(this.map)
			.find((iSid) => fn(this.map[iSid]));

		return sid;
	}
}

module.exports.CSession = CSession;
