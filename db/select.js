const { client } = require('./client');
const { SYSTEM, PROFILES, ORDERS, STATISTICS } = require('./queries');

client.connect().then(async () => {
	let res;

	// res = await client.query(SYSTEM.TABLES);
	res = await client.query(PROFILES.SELECT);
	// res = await client.query(PROFILES.SELECT_COUNT);
	// res = await client.query(ORDERS.SELECT);
	// res = await client.query(STATISTICS.SELECT);
	// res = await client.query(STATISTICS.SELECT_LAST);

	console.log('RES:', JSON.stringify(res.rows), res.rowCount);

	client.disconnect();
});
