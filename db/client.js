const { Client } = require('pg');
const { envConfig } = require('../src//config/env');
const POSTGRES_CONNECTION_URL = envConfig.get('POSTGRES_CONNECTION_URL');

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
				};
			
				console.log('Connected!');
			});
	}

	async disconnect() {
		await this.pgclient.end();
	}

	async query(...args) {
		console.log(...args);
		return this.pgclient.query(...args);
	}
}

module.exports.client = new PgClient();
