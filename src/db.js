const goodsDb = require('../data/ewg_db.json');

class Db {
	constructor() {
		this.version = goodsDb.version;
		this.goods = goodsDb.goods;
		this.goodsMap = goodsDb.goods.reduce((acc, cur) => {
			acc[cur.id] = cur;
			return acc;
		}, {});

		// this.profiles = [];
		this.profilesMap = {};
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

	async addProfile({ tId, tNickname }) {
		const profile = this._makeProfile({ tId, tNickname });

		this.profilesMap[profile.id] = profile;

		return profile;
	}

	async queryProfiles() {
		return {
			profiles: Object.values(this.profilesMap),
		};
	}

	async queryProfileOrders(profileId) {
		const sell = this.sellOrders.filter((iOrder) => {
			return iOrder.profileId === profileId;
		});

		const buy = this.buyOrders.filter((iOrder) => {
			return iOrder.profileId === profileId;
		});
		let orders = sell.concat(buy);

		orders = orders.slice(0);
		return orders;
	}

	async addOrder({ profileId, orderType, goodsId, amountType, price }) {
		const order = this._makeOrder({ profileId, orderType, goodsId, amountType, price });

		if (orderType === 'buy') {
			this.buyOrders.push(order);
		} else if (orderType === 'sell') {
			this.sellOrders.push(order);
		}

		return order;
	}

	async removeOrder(orderId) {
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

		let orders = marketOrders.filter((iOrder) => {
			const goods = this.goodsMap[iOrder.goodsId];

			return goods.name.toLowerCase().indexOf(text) !== -1;
		});

		orders = orders.slice(0);
		return orders;
	}

	_makeOrder({ profileId, orderType, goodsId, amountType, price }) {
		const profile = this._findProfile(profileId);
// console.log(profileId, JSON.stringify(profile));
		return {
			id: this._makeOrderId(),
			date: Date.now(),
			orderType,
			goodsId,
			amountType,
			price,
			profileId,
			profile: profile,
		};
	}

	_makeProfile({ tId, tNickname }) {
		const date = Date.now();
		const profileId = Date.now();

		return {
			regDate: date,
			id: profileId,
			tId,
			tNickname,
		};
	}

	_makeOrderId() {
		return Date.now();
	}

	_findProfile(profileId) {
		return this.profilesMap[profileId];
	}
}

module.exports = Db;
