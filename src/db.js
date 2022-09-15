const goodsDb = require('../data/ewg_db.json');

class Db {
	constructor() {
		this.version = goodsDb.version;
		this.goods = goodsDb.goods;
		this.goodsMap = goodsDb.goods.reduce((acc, cur) => {
			acc[cur.id] = cur;
			return acc;
		}, {});

		this.profiles = [];
		this.buyOrders = [];
		this.sellOrders = [];
	}

	init() {

	}

	start() {

	}

	getGoods(goodsId) {
		return this.goodsMap[goodsId];
	}

	queryProfileOrders(profileId) {
		const sell = market.sellOrders.filter((iOrder) => {
			return iOrder.profileId === profileId;
		});

		const buy = market.sellOrders.filter((iOrder) => {
			return iOrder.profileId === profileId;
		});

		return { buy: buy, sell: sell };
	}

	async querySellOrders(text) {
		text = String(text).toLocaleLowerCase();

		const orders = this.sellOrders.filter((iOrder) => {
			const goods = this.goodsMap[iOrder.goodsId];

			return goods.name.toLowerCase().indexOf(text) !== -1;
		});

		return orders;
	}

	placeOrder({ profileId, orderType, goodsId, price }) {
		const order = this._makeOrder({ profileId, orderType, goodsId, price });

		if (orderType === 'buy') {
			this.buyOrders.push(order);
		} else if (orderType === 'sell') {
			this.sellOrders.push(order);
		}

		return order;
	}

	revokeOrder(profileId, orderId) {
		this.buyOrders.push(order);
		this.sellOrders.push(order);
	}

	_makeProfile() {
		const date = new Date();
		return {
			date: date,
			profileId: this.profiles.length + 1,
		};
	}
	
	_makeOrder({ profileId, orderType, goodsId, price }) {
		return {
			id: this._makeOrderId(),
			date: Date.now(),
			profileId: profileId,
			orderType: orderType,
			goodsId: goodsId,
			price: price,
		};
	}

	_makeOrderId() {
		return Date.now();
	}
}

module.exports = Db;
