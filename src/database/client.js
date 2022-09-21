const { Client } = require('pg');
const { CConsole } = require('../utils/index');
const { envConfig } = require('../config/env');

const POSTGRES_CONNECTION_URL = envConfig.get('POSTGRES_CONNECTION_URL');
const cout = new CConsole('FgCyan');

class PgClient {
	constructor() {}

	async connect() {
		this.pgclient = new Client({
			connectionString: POSTGRES_CONNECTION_URL,
			ssl: {
				rejectUnauthorized: false
			}
		});

		return this.pgclient.connect()
			.then((er) => {
				if (er) {
					throw er
				}
			});
	}

	async query(...args) {
		const t1 = performance.now();
		let dt;

		try {
			const res = await this.pgclient.query(...args);
			dt = (performance.now() - t1)|0;
			cout.log(`[PGC] [${dt}]`,...args);
			return res;
		} catch (er) {
			dt = (performance.now() - t1)|0;
			cout.log(`[PGC] [${dt}] Error`, ...args);
			throw er;
		}
	}
}

module.exports.client = new PgClient();
