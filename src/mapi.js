const market = {
	users: Object.create(null),
	buyOrders: [],
	sellOrders: []
};

const makeBuyOrder = () => {};
const makeSellOrder = () => {
	return {
		date: Date.now(),
		index: market.sellOrders.length + 1,
	};
};

module.exports = {
	ping: () => ({ name: 'mapi', ping: true, ts: Date.now() }),
	root: () => ({ name: 'mapi', version: '1.0.0' }),
	status: () => ({
		buyOrders: market.buyOrders.length,
		sellOrders: market.sellOrders.length,
	}),

	// todo auth
	placeorder: (userId, type, itemId) => {
		// if (type === 'buy') {
		// 	const order = makeBuyOrder();
		// } else {

		// }
		const order = makeSellOrder();
		market.sellOrders.push(order);
		
		return { order: order, success: true };
	},

	list: () => {
		return {
			buy: market.buyOrders,
			sell: market.sellOrders
		}
	}
};
