const { client } = require('./client');
const { SYSTEM, PROFILES, ORDERS, STATISTICS } = require('./queries');

client.connect().then(async () => {
	// const res_ssessions = await client.query(CREATE_SESSIONS);
	const res_profiles = await client.query(PROFILES.CREATE);
	const res_orders = await client.query(ORDERS.CREATE);
	const res_stats = await client.query(STATISTICS.CREATE);

	// console.log('sessions', JSON.stringify(res_ssessions));
	console.log('profiles', JSON.stringify(res_profiles));
	console.log('orders', JSON.stringify(res_orders));
	console.log('stats', JSON.stringify(res_stats));

	client.disconnect();
});

// client.connect().then(async () => {
// 	const res = await client.query(SYSTEM.TABLES);

// 	console.log('result');
// 	console.log(JSON.stringify(res.rows), null, ' ');
// });
