const { Client } = require('pg');

const config = {
	url: 'postgres://crxvqnllczevrl:5b88072b722ce0836e612b6ad1378508c2b4d37fa49f454d65b04a2c6d66e993@ec2-34-247-72-29.eu-west-1.compute.amazonaws.com:5432/d5e3lpcfop16pa',
	host: 'ec2-34-247-72-29.eu-west-1.compute.amazonaws.com',
	port: 5432,
	database: 'd5e3lpcfop16pa',
	user: 'crxvqnllczevrl',
	password: '5b88072b722ce0836e612b6ad1378508c2b4d37fa49f454d65b04a2c6d66e993',
};

const client = new Client({
	connectionString: config.url,
	ssl: {
		rejectUnauthorized: false
	}
});

client.connect(function(er) {
	if (er) {
		throw er
	};

	console.log("Connected!");
});
