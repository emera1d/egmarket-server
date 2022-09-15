const Db = require('./db');
const database = new Db();

const MIN_ORDER_PRICE = 1;
const MAX_ORDER_PRICE = 1000000;
const MAX_ORDERS_IN_SEARCH = 50;

module.exports = {
	root: async () => ({ name: 'mapi' }),
	mapi: async () => ({ name: 'mapi', version: '1.0.0', ts: Date.now() }),
	status: async () => ({
		status: {
			profiles: database.profiles.length,
			buyOrders: database.buyOrders.length,
			sellOrders: database.sellOrders.length,
		}
	}),

	list: async () => {
		return {
			error: 'deprecated',
			// buy: database.buyOrders,
			// sell: database.sellOrders
		}
	},

	marketinfo: async () => ({ version: database.version }),
	marketdata: async () => ({ version: database.version, goods: database.goods }),

	profileregister: async (profileId) => {
		// const user = makeUser();

		// market.profiles.push(user);
		return {
			error: 'not implemented'
		};
	},

	profileorders: async (req, res) => {
		const { profileId } = req.body;

		if (profileId) {
			return await database.queryProfileOrders(profileId);
		} else {
			return { error: 'Invalid profileId' };
		}
	},

	placeorder: async (req, res) => {
		const { profileId, orderType, goodsId, price } = req.body;
		// console.log(profileId, orderType, goodsId, price, JSON.stringify(req.body));
		// const isValidProfile = database.profiles.hasOwnProperty(profileId);
		const isValidOrderType = orderType === 'buy' || orderType === 'sell';
		const isValidGoods = database.goods.some((iGoods) => iGoods.id === goodsId);
		const isValidPrice = price >= MIN_ORDER_PRICE && price <= MAX_ORDER_PRICE;

		if (!isValidPrice || !isValidGoods || !isValidOrderType) {
			return { error: 'validation', isValidOrderType, isValidGoods, isValidPrice };
		}

		const order = await database.placeOrder({ profileId, orderType, goodsId, price });
		// console.log(order);
		return { order: order, status: 'success' };
	},

	revokeorder: async (req, res) => {
		return { error: 'not implemented' };
	},

	searchforsale: async (req, res) => {
		let { text, goodsId, type, subType } = req.body;

		text = String(text).trim();

		if (text === '') {
			return { orders: [], count: 0 };
		}

		const orders = await database.querySellOrders(text);

		return { orders: orders.slice(0, MAX_ORDERS_IN_SEARCH), count: orders.length };
	}
};
