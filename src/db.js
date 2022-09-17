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

	async queryProfileOrders(profileId) {
		const sell = market.sellOrders.filter((iOrder) => {
			return iOrder.profileId === profileId;
		});

		const buy = market.sellOrders.filter((iOrder) => {
			return iOrder.profileId === profileId;
		});

		return { buy: buy, sell: sell };
	}

	addOrder({ profileId, orderType, goodsId, amount, price }) {
		const order = this._makeOrder({ profileId, orderType, goodsId, amount, price });

		if (orderType === 'buy') {
			this.buyOrders.push(order);
		} else if (orderType === 'sell') {
			this.sellOrders.push(order);
		}

		return order;
	}

	removeOrder(orderId) {
		this.sellOrders = this.sellOrders.filter((iOrder) => iOrder.orderId !== orderId);
		this.buyOrders = this.buyOrders.filter((iOrder) => iOrder.orderId !== orderId);
	}

	async queryOrder(orderId) {
		let order = this.sellOrders.find((iOrder) => iOrder.orderId === orderId);
		if (order) {
			return order;
		}

		order = this.buyOrders.find((iOrder) => iOrder.orderId === orderId);
		if (order) {
			return order;
		}

		return null;
	}

	async queryOrders(orderType, text) {
		text = String(text).toLocaleLowerCase().trim();

		if (text === '') {
			return [];
		}

		const marketOrders = orderType === 'buy' ? this.buyOrders : this.sellOrders;

		const orders = marketOrders.filter((iOrder) => {
			const goods = this.goodsMap[iOrder.goodsId];

			return goods.name.toLowerCase().indexOf(text) !== -1;
		});

		return orders;
	}

	_makeProfile() {
		const date = new Date();
		return {
			date: date,
			profileId: this.profiles.length + 1,
		};
	}
	
	_makeOrder({ profileId, orderType, goodsId, amountType, price }) {
		return {
			id: this._makeOrderId(),
			date: Date.now(),
			profileId,
			orderType,
			goodsId,
			amountType,
			price,
		};
	}

	_makeOrderId() {
		return Date.now();
	}
}

module.exports = Db;
