const { client } = require('./client');
const { SYSTEM, PROFILES, ORDERS, STATISTICS } = require('./queries');

client.connect().then(async () => {
	const res_profiles = await client.query(STATISTICS.TRUNCATE);

	console.log('statistics', JSON.stringify(res_profiles));

	client.disconnect();
});
