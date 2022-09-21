const { client } = require('./client');
const { PROFILES, ORDERS, STATISTICS } = require('../../db/queries');

const goodsDb = require('../../data/ewg_db.json');

class CDatabase {
	constructor() {
		this.version = goodsDb.version;
		this.goods = goodsDb.goods;
		this.goodsMap = goodsDb.goods.reduce((acc, cur) => {
			acc[cur.id] = cur;
			return acc;
		}, {});
	}

	async connect() {
		this.pclient = client;

		const result = await this.pclient.connect();
	}

	async profilesCount() {
		const res = await this.pclient.query(PROFILES.SELECT_COUNT);

		return { count: res.rowCount };
	}

	async addProfile({ telegramId, username }) {
		const res = await this.pclient.query(PROFILES.INSERT, [
			Date.now(),
			telegramId,
			username,
			''
		]);

		return { telegramId, username };
	}

	async queryProfile(data) {
		const { profileId, telegramId, sid } = data;
		let res;

		if (profileId) {
			res = await this.pclient.query(PROFILES.SELECT_BY_PID, [
				profileId
			]);
		} else if (telegramId) {
			res = await this.pclient.query(PROFILES.SELECT_BY_TID, [
				telegramId
			]);
		} else if (sid) {
			res = await this.pclient.query(PROFILES.SELECT_BY_SID, [
				sid
			]);
		}

		let profile = null;
		const row = res?.rows[0];
		if (row) {
			profile = this._rowToProfile(row);
		}

		return { profile };
	}

	async updateProfile(query, data) {
		const { profileId, telegramId } = query;
		let res;

		if (profileId) {
			res = await this.pclient.query(PROFILES.UPDATE_BY_PID_OTP, [
				data.sid,
				data.isAuth,
				data.otp,
				profileId,
			]);
		} else {
			res = await this.pclient.query(PROFILES.UPDATE_BY_TID, [
				data.otp,
				telegramId,
			]);
		}
	}

	async queryProfileOrders(profileId) {
		const res = await this.pclient.query(ORDERS.SELECT_BY_PID, [
			profileId,
		]);

		let orders = [];
		if (res.rows) {
			orders = res.rows.map(this._rowToOrder);
		}

		return orders;
	}

	async queryProfiles() {
		let profiles = null;
		const res = await this.pclient.query(PROFILES.SELECT);

		profiles = res.rows.map(this._rowToProfile);

		return { profiles };
	}
// orders
	async addOrder({ profileId, telegramId, username, orderType, goodsId, amountType, price }) {
		const res = await this.pclient.query(ORDERS.INSERT, [
			Date.now(),
			profileId,
			telegramId,
			username,
			orderType,
			goodsId,
			amountType,
			price,
		]);
		// const order = res.rows[0];

		return { success: true };
	}

	async updateOrder({ profileId, orderId, date }) {
		const res = await this.pclient.query(ORDERS.UPDATE, [
			date,
			profileId,
			orderId,
		]);

		const order = res.rows[0];

		return { order };
	}

	async removeOrder(profileId, orderId) {
		const res = await this.pclient.query(ORDER.DELETE_BY_OID, [orderId, profileId]);

		return true;
	}

	async queryOrders({ orderType, goodsIds }) {
		const res = await this.pclient.query(ORDERS.SELECT_SEARCH, [
			orderType,
			goodsIds,
		]);
		const orders = res.rows.map(this._rowToOrder);

		return { orders };
	}

	async ordersCount({ profileId }) {
		const res = await this.pclient.query(ORDERS.SELECT_COUNT_BY_PID, [
			profileId
		]);

		return { count: res.rowCount };
	}

	async queryLastOrders({ orderType }) {
		const res = await this.pclient.query(ORDERS.SELECT_LAST, [
			orderType,
		]);
		const orders = res.rows.map(this._rowToOrder);

		return { orders };
	}
// statistics
	async getLastStatistics() {
		const res = await this.pclient.query(STATISTICS.SELECT_LAST);
		const data = res.rows[0] || null;

		if (data) {
			return { 
				date: Number(data.date),
				statistics: JSON.parse(data.statistics),
			};
		} else {
			return null;
		}
	}

	async addStatistics({ date, statistics }) {
		const res = await this.pclient.query(STATISTICS.INSERT, [
			date,
			JSON.stringify(statistics),
		]);

		return { success: true };
	}

	async updateStatistics({ date, statistics }) {
		const res = await this.pclient.query(STATISTICS.UPDATE, [
			date,
			JSON.stringify(statistics),
		]);

		return { success: true };
	}

// private
	// getGoods(goodsId) {
	// 	return this.goodsMap[goodsId];
	// }

	_rowToProfile(row) {
		return {
			id: row.id,
			regDate: row.reg_date,
			telegramId: row.telegram_id,
			username: row.username,

			sid: row.sid,
			isAuth: row.is_auth,
			otp: row.otp,
		};
	}

	_rowToOrder(row) {
		return {
			id: row.id,
			date: Number(row.date), // TODO check type bigint
			profileId: Number(row.profile_id), // TODO check type bigint,
			telegramId: Number(row.telegram_id), // TODO check type bigint,
			username: row.username,
			orderType: row.order_type,
			goodsId: row.goods_id,
			amountType: row.amount_type,
			price: row.price,
		};
	}
}

module.exports.CDatabase = CDatabase;
