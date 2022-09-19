const { Client } = require('pg');
const {
	INSERT_PROFILES,
	SELECT_PROFILES,
	SELECT_PROFILES_BY_TID,
} = require('../db/queries');
const goodsDb = require('../data/ewg_db.json');
const { envConfig } = require('./config/env');

const POSTGRES_CONNECTION_URL = envConfig.get('POSTGRES_CONNECTION_URL');

const PROFILE_ID_START = 1000;

class CDatabase {
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

	async connect() {
		this.pclient = new Client({
			connectionString: POSTGRES_CONNECTION_URL,
			ssl: {
				rejectUnauthorized: false
			}
		});

		const result = await this.pclient.connect();
		console.log('[DB] postgres connected');
	}
	// done
	async addProfile({ telegramId, username }) {
		const res = await this.pclient.query(INSERT_PROFILES, [
			Date.now(),
			telegramId,
			username,
			''
		]);

		return { telegramId, username };
	}
	// done
	async queryProfile(data) {
		const { profileId, telegramId } = data;
		let res;

		if (profileId) {
			res = await this.pclient.query(SELECT_PROFILES_BY_PID, [
				profileId
			]);
		} else {
			res = await this.pclient.query(SELECT_PROFILES_BY_TID, [
				telegramId
			]);
		}

		let profile = null;
		const row = res.rows[0];
		if (row) {
			profile = this._rowToProfile(row);
		}

		return { profile };
	}

	// todo
	async updateProfile(query, data) {
		const { profile } = await this.queryProfile(query);

		if (profile) {
			this.profilesMap[profile.id] = Object.assign({}, profile, data);
		} 
	}
	// todo
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
	// done
	async queryProfiles() {
		let profiles = null;
		const res = await this.pclient.query(SELECT_PROFILES);

		profiles = res.rows.map(this._rowToProfile);

		return { profiles };
	}
	// todo
	async addOrder({ profileId, orderType, goodsId, amountType, price }) {
		const order = await this._makeOrder({ profileId, orderType, goodsId, amountType, price });

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

	getGoods(goodsId) {
		return this.goodsMap[goodsId];
	}

// private
	_rowToProfile(row) {
		return {
			id: row.id,
			regDate: row.reg_date,
			telegramId: row.telegram_id,
			username: row.username,
		};
	}

	_makeOrder({ profileId, orderType, goodsId, amountType, price }) {
		const { profile } = await this.queryProfile({ profileId });
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

	_makeOrderId() {
		return Date.now();
	}

	_findProfile(profileId) {
		return this.profilesMap[profileId];
	}
}

module.exports = CDatabase;
