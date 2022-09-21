const { client } = require('./client');

client.connect().then(async () => {
	// const res_ssessions = await client.query(INSERT_SESSIONS);
	const res_profiles = await client.query(INSERT_PROFILES, [
		Date.now(),
		1,
		'username',
		''
	]);
	// const res_orders = await client.query(INSERT_ORDERS);

	// console.log('sessions', JSON.stringify(res_ssessions));
	console.log('profiles', JSON.stringify(res_profiles));
	// console.log('orders', JSON.stringify(res_orders));

});

