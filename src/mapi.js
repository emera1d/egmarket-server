const Db = require('./db');

const MIN_ORDER_PRICE = 1;
const MAX_ORDER_PRICE = 1000000;
const MAX_ORDERS_IN_SEARCH = 50;
const ORDER_TYPES = ['buy', 'sell'];

const database = new Db();

module.exports = {
	root: async () => ({ name: 'mapi' }),
	mapi: async () => ({ name: 'mapi', version: '1.0.0', ts: Date.now() }),
// market
	marketinfo: async () => ({ version: database.version }),
	marketdata: async () => ({ version: database.version, goods: database.goods }),
	marketstatus: async () => ({
		status: {
			profiles: Object.keys(database.profilesMap).length,
			buyOrders: database.buyOrders.length,
			sellOrders: database.sellOrders.length,
		}
	}),
// profiles
	profileauth: async (req, res) => {
		return { profileId: 1 };
	},

	profilesregister: async (req, res) => { // todo auth
		const { tId, tNickname } = req.body;
		const profile = await database.addProfile({
			tId,
			tNickname,
		});

		return { status: 'success', profile };
	},

	profilesorders: async (req, res) => { // todo auth
		const { profileId } = req.body;

		if (profileId) {
			return await database.queryProfileOrders(profileId);
		} else {
			return { error: 'Invalid profileId' };
		}
	},

	profileslist: async (req, res) => {
		return await database.queryProfiles();
	},
// orders
	ordersplace: async (req, res) => {
		const { profileId, orderType, goodsId, price } = req.body;
		// console.log(profileId, orderType, goodsId, price, JSON.stringify(req.body));

		// TODO auth
		// const isValidProfile = database.profiles.hasOwnProperty(profileId);
		const isValidOrderType = orderType === 'buy' || orderType === 'sell';
		const isValidGoods = database.goods.some((iGoods) => iGoods.id === goodsId);
		const isValidPrice = price >= MIN_ORDER_PRICE && price <= MAX_ORDER_PRICE;

		if (!isValidPrice || !isValidGoods || !isValidOrderType) {
			return { error: 'validation', isValidOrderType, isValidGoods, isValidPrice };
		}

		const order = await database.addOrder({ profileId, orderType, goodsId, price });
		console.log(JSON.stringify(order));
		return { order: order, status: 'success' };
	},

	ordersrevoke: async (req, res) => {
		let { profileId, orderId } = req.body;

		// const isValidProfile = profileId
		const isValidOrder = await database.queryOrder(orderId);
		if (!isValidOrder) {
			return { error: 'validation', isValidOrder }
		}

		const result = await database.removeOrder(orderId);
		// TODO auth
		return { error: 'not implemented' };
	},

	orderssearch: async (req, res) => {
		let { orderType, text, goodsId, type, subType } = req.body;
		text = String(text).trim();

		if (text === '') {
			return { orders: [], count: 0 };
		}

		const isValidOrderType = ORDER_TYPES.includes(orderType);

		if (!isValidOrderType) {
			return { error: 'validation', isValidOrderType, orderType, text, goodsId, type, subType };
		}

		let orders;
		switch (orderType) {
			case 'buy':
				orders = await database.queryOrders('buy', text);
				break;
			case 'sell':
				orders = await database.queryOrders('sell', text);
				break;
		}

		if (orders) {
			return { orders: orders.slice(0, MAX_ORDERS_IN_SEARCH), count: orders.length };
		} else {
			return { error: 'orders/search', orderType, text, goodsId, type, subType  };
		}
	}
};
