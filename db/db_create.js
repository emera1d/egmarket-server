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

client.connect(async function(er) {
	if (er) {
		throw er
	};

	console.log('Connected!');

	const res_ssessions = await client.query(CREATE_SESSIONS);
	const res_profiles = await client.query(CREATE_PROFILES);
	const res_orders = await client.query(CREATE_ORDERS);

	console.log('sessions', JSON.stringify(res_ssessions));
	console.log('profiles', JSON.stringify(res_profiles));
	console.log('orders', JSON.stringify(res_orders));

});


const CREATE_SESSIONS = `CREATE TABLE IF NOT EXISTS "SESSIONS" (
	sid text,
	profile_id bigint,
	is_auth boolean
);`;

const CREATE_PROFILES = `CREATE TABLE IF NOT EXISTS "PROFILES" (
	id SERIAL,
	reg_date bigint,
	telegram_id bigint,
	username text,
	otp varchar(32),
	PRIMARY KEY ("id")
);`;

const CREATE_ORDERS = `CREATE TABLE IF NOT EXISTS "ORDERS" (
	id SERIAL,
	date bigint,
	profile_id bigint
	order_type smallint,
	goods_id bigint,
	amount_type smallint,
	price bigint,
);`;
