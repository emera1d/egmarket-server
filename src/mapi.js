const { appConfig } = require('./config/appConfig');
const { meta } = require('./config/meta');
const { time } = require('./utils');

const { CDatabase } = require('./database/database');
const { CSession } = require('./session');
const { CStatistics } = require('./statistics');

const session = new CSession();
const database = new CDatabase();
const statistics = new CStatistics();

database.connect()
.then(async () => {
	console.log('[DB] postgres connected');

	const today = statistics.makeDate();
	const stats = await database.getStatistics(today);
	if (stats) {
		statistics.init(stats);
	}
	statistics.on({
		onFlush: async (stats) => {
			const dbRes = await database.getStatistics(stats.date);

			if (dbRes && dbRes.date === stats.date) {
				const res = await database.updateStatistics(stats);		
			} else {
				const res = await database.addStatistics(stats);		
			}
		}
	})
});

class CMapi {
	constructor() {
		this.name = 'mapi';
		this.events = {};
	}
	async root() {
		return { name: 'mapi' }
	}
	async mapi() { return { name: 'mapi', version: '1.0.0', ts: Date.now() } }
	async statistics() { return { statistics: statistics.view() } }
	async marketinfo() { return { version: database.version } }
	async marketdata() { return { version: database.version, goods: database.goods } }
	async marketstatus() {
		return {
			// status: {
			// 	profiles: Object.keys(database.profilesMap).length,
			// 	buyOrders: database.buyOrders.length,
			// 	sellOrders: database.sellOrders.length,
			// }
			status: {
				profiles: 'todo',
				buyOrders: 'todo',
				sellOrders: 'todo'
			}
		};
	}
// profiles
	async profilesauth(req, res) {
		const profile = await this._getSessionProfile(req);

		if (profile) {
			return {
				success: true,
				profile: this._clientProfile(profile),
			};
		} else {
			return { success: false, error: 'session not found' };
		}
	}

	async profilesgetotp(req, res) {
		const { telegramId } = req.body;

		const isValidTId = telegramId && telegramId !== undefined;
		if (!isValidTId) {
			return { success: false, isValidTId };
		}

		const otp = String(Date.now()).slice(-4);
		await database.updateProfile({ telegramId }, { otp });

		await this.events.onGetOtp({
			telegramId,
			otp,
		});

		return { success: true };
	}

	// TODO get telegram username for update
	async profileslogin(req, res) {
		const { telegramId, password } = req.body;
		const isValidTId = telegramId && telegramId !== undefined;
		const isValidPassword = Boolean(password);

		if (isValidTId && isValidPassword) {
			const { profile } = await database.queryProfile({ telegramId });
			const profileId = profile?.id;

			if (profile === null) {
				return { success: false, message: 'Profile not found' };
			}

			const isValidProfile = profile !== null;
			const isValidProfilePassword = profile.otp === password;

			if (isValidProfile && isValidProfilePassword) {
				const sid = session.make();
				await database.updateProfile({ profileId }, { sid, isAuth: true, otp: '' });

				const maxAge = 30 *24 *60 *60 *1000;
				// const maxAge = 90000
				res.cookie(appConfig.SID_COOKIE_NAME, sid, {
					maxAge,
					httpOnly: true,
					sameSite: 'none',
					secure: true,
				});
				return { 
					success: true,
					profile: this._clientProfile(profile),
				};
			} else {
				return { error: 'validation', isValidProfile, isValidProfilePassword };
			}
		} else {
			return { error: 'login', isValidTId, isValidPassword };
		}
	}

	async profilesregister(req, res) {
		const { telegramId, username } = req.body;

		return await this.profileRegister({ telegramId, username });
	}

	async profilesorders(req, res) {
		const profile = await this._getSessionProfile(req);

		if (profile) {
			let orders = await database.queryProfileOrders(profile.id);

			orders = orders.sort((iO1, iO2) => iO2.date - iO1.date);
			orders.forEach((iOrder) => {
				if(Date.now() - iOrder.date > meta.ORDER_EXPIRY) {
					iOrder.isExpired = true;
				}
			});

			return { orders };
		} else {
			return { error: 'Profile not found' };
		}
	}
// orders
	async ordersplace(req, res) {
		const { orderType, goodsId, amountType, price } = req.body;

		const isValidOrderType = meta.ORDER_TYPES.includes(orderType);
		const isValidGoods = database.goods.some((iGoods) => iGoods.id === goodsId);
		const isValidAmountType = meta.AMOUNT_TYPES.includes(amountType);
		const isValidPrice = price >= meta.MIN_ORDER_PRICE && price <= meta.MAX_ORDER_PRICE;

		if (!isValidPrice || !isValidGoods || !isValidOrderType || !isValidAmountType) {
			return { error: 'validation', isValidOrderType, isValidGoods, isValidAmountType, isValidPrice };
		}

		// const sid = req.cookies[appConfig.SID_COOKIE_NAME];
		// const { profile } = await database.queryProfile({ sid });
		const profile = await this._getSessionProfile(req);
		const { count } = await database.ordersCount({ profileId: profile.id });

		if (count < meta.MAX_PROFILE_ORDERS) {
			const dbRes = await database.addOrder({
				profileId: profile.id,
				telegramId: profile.telegramId,
				username: profile.username,
				orderType,
				goodsId,
				amountType,
				price,
			});

			return { success: true };
		} else {
			return { success: false, message: 'Maximum orders' };
		}
	}

	async ordersrevoke(req, res) {
		let { orderId } = req.body;

		const isValidOrder = Boolean(orderId)
		if (!isValidOrder) {
			return { success: false, message: 'Invalid order', isValidOrder }
		}

		// const sid = req.cookies[appConfig.SID_COOKIE_NAME];
		// const { profile } = await database.queryProfile({ sid });
		const profile = await this._getSessionProfile(req);
		const result = await database.removeOrder(profile.id, orderId);

		return { success: true };
	}

	async ordersrenew(req, res) {
		let { orderId } = req.body;

		const isValidOrder = Boolean(orderId)
		if (!isValidOrder) {
			return { success: false, message: 'Invalid order', isValidOrder }
		}

		// const sid = req.cookies[appConfig.SID_COOKIE_NAME];
		// const { profile } = await database.queryProfile({ sid });
		const profile = await this._getSessionProfile(req);
		const result = await database.updateOrder({
			profileId: profile.id,
			orderId,
			date: Date.now(),
		});

		return { success: true };
	}

	async orderssearch(req, res) {
		let { orderType, text } = req.body;

		const isValidOrderType = meta.ORDER_TYPES.includes(orderType);
		if (!isValidOrderType) {
			return { error: 'validation', isValidOrderType };
		}

		text = String(text).trim();

		let orders;
		if (text === '') {
			const dbRes = await database.queryLastOrders({ orderType });
			orders = dbRes.orders;
		} else {
			const goodsIds = this._findGoodsIds(text);
			const dbRes = await database.queryOrders({ orderType, goodsIds });
			orders = dbRes.orders;
		}

		if (orders) {
			orders = orders
				.filter((iOrder) => Date.now() - iOrder.date <= meta.ORDER_EXPIRY)
				.sort((iO1, iO2) => iO2.date - iO1.date);

			return { orders: orders.slice(0, appConfig.MAX_ORDERS_IN_SEARCH), count: orders.length };
		} else {
			return { error: 'orders/search', orderType, text, goodsId };
		}
	}

	async profileRegister({ telegramId, username }) {
		const isValidTId = typeof telegramId === 'number';
		const isValidTUsername = typeof username === 'string' && username.length > 0;

		if (!isValidTId || !isValidTUsername) {
			return { success: false, message: 'validation', isValidTId, isValidTUsername };
		}

		const dbRes = await database.queryProfile({ telegramId });
		if (dbRes.profile) {
			return { success: false, message: 'Profile already exist (tid)' };
		}

		const profile = await database.addProfile({
			telegramId,
			username,
		});

		return { success: true, profile };
	}

	_findGoodsIds(text) {
		let goods = database.goods.filter((iGoods) => {
			return iGoods.name.toLowerCase().indexOf(text) !== -1
				&& this._canBeTraded(iGoods);
		});
		const ids = goods.map((iGoods) => iGoods.id);

		return ids;
	}

	_canBeTraded(goods) {
		return !goods.isDisabled && !goods.isPersonal;
	}

	_clientProfile(profile) {
		return {
			id: profile.id,
			maxOrders: meta.MAX_PROFILE_ORDERS,
		};
	}

	async _getSessionProfile(req) {
		const sid = req.cookies[appConfig.SID_COOKIE_NAME];

		if (sid) {
			const sessionData = session.get(sid);

			if (sessionData) {
				return sessionData;
			} else {
				const { profile } = await database.queryProfile({ sid });
				session.set(sid, profile);

				return profile;
			}
		} else {
			return null;
		}
	}

	on(events) {
		this.events = events || {};
	}

	route(action, shouldAuth) {
		return async (req, res) => {
// console.log('action', action);
			if (!this[action]) {
				return { success: false, error: 'Invalid action' };
			}
// console.log('action auth', action);
			if (shouldAuth) {
				const sessionData = await this._getSessionProfile(req);
				if (sessionData === null) {
					res.send(JSON.stringify({ success: false, error: 'Auth failed' }));
					return;
				}
			}
// console.log('action call', action);
			const method = req.method;
			const url = req.url;
			console.log('[MAPI]', `[${time()}] ${method} ${url}`);

			statistics.push(url);

			const result = await this[action].call(this, req, res);
			const data = JSON.stringify(result);
	
			res.send(data);
		};
	}
};


module.exports.mapi = new CMapi();
