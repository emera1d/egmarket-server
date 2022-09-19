const goodsDb = require('../data/ewg_db.json');

const PROFILE_ID_START = 1000;

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

		// statistics
		this.statistics = {};
	}

	init() {

	}

	start() {

	}

	getGoods(goodsId) {
		return this.goodsMap[goodsId];
	}

	async addProfile({ telegramId, username }) {
		const profile = this._makeProfile({ telegramId, username });

		this.profilesMap[profile.id] = profile;

		return profile;
	}

	async queryProfile(data) {
		const { profileId, telegramId } = data;
		let profile;
// console.log(JSON.stringify(data));
// console.log(JSON.stringify(this.profilesMap));
		if (profileId) {
			profile = this.profilesMap[profileId] || null;
		} else if (telegramId) {
			profile = Object.values(this.profilesMap)
				.find((iProfile) => iProfile.telegramId === telegramId) || null;
		}

		return { profile };
	}

	async updateProfile(query, data) {
		const { profile } = await this.queryProfile(query);

		if (profile) {
			this.profilesMap[profile.id] = Object.assign({}, profile, data);
		} 
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

	async queryProfiles() {
		return {
			profiles: Object.values(this.profilesMap),
		};
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

	async updateOrder({ orderId, date }) {
		const order = await this.queryOrder(orderId);

		order.date = date;

		return order;
	}

	async removeOrder(orderId) {
		this.sellOrders = this.sellOrders.filter((iOrder) => iOrder.id !== orderId);
		this.buyOrders = this.buyOrders.filter((iOrder) => iOrder.id !== orderId);
	}

	async queryOrder(orderId) {
		let order = this.sellOrders.find((iOrder) => iOrder.id === orderId);
		if (order) {
			return order;
		}

		order = this.buyOrders.find((iOrder) => iOrder.id === orderId);
		if (order) {
			return order;
		}

		return null;
	}

	async queryOrders(orderType, text) {
		let orders;

		text = String(text).toLocaleLowerCase().trim();

		if (text === '') {
			orders = orderType === 'buy' ? this.buyOrders : this.sellOrders;
		} else {
			const marketOrders = orderType === 'buy' ? this.buyOrders : this.sellOrders;
	
			orders = marketOrders.filter((iOrder) => {
				const goods = this.goodsMap[iOrder.goodsId];
	
				return goods.name.toLowerCase().indexOf(text) !== -1;
			});
		}

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
			profile: {
				id: profile.id,
				telegramId: profile.telegramId,
				username: profile.username,
			},
		};
	}

	_makeProfile({ telegramId, username }) {
		const date = Date.now();
		// todo rework
		const profileId = PROFILE_ID_START + Object.keys(this.profilesMap).length; // Date.now();

		return {
			regDate: date,
			id: profileId,
			telegramId,
			username,
			// otp: '333',
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
