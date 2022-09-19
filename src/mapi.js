const { meta } = require('./config/meta');
const { appConfig } = require('./config/appConfig');
const { time } = require('./utils');

const CDatabase = require('./database');
const { CSession } = require('./session');

const session = new CSession();
const database = new CDatabase();

database.connect();

class CMapi {
	constructor() {
		this.name = 'mapi';
		this.events = {};
	}
	async root() {
		return { name: 'mapi' }
	}
	async mapi() { return { name: 'mapi', version: '1.0.0', ts: Date.now() } }
	async statistics() { return { statistics: database.statistics } }
// market
	async marketinfo() { return { version: database.version } }
	async marketdata() { return { version: database.version, goods: database.goods } }
	async marketstatus() {
		return {
			status: {
				profiles: Object.keys(database.profilesMap).length,
				buyOrders: database.buyOrders.length,
				sellOrders: database.sellOrders.length,
			}
		};
	}
// profiles
	async profilesauth(req, res) {
		const sidValue = req.cookies[appConfig.SID_COOKIE_NAME];

		if (sidValue) {
			const hasSession = session.has(sidValue);

			if (hasSession) {
				const sessionData = session.get(sidValue);

				return {
					success: true,
					profile: { id: sessionData.profileId },
				};
			} else {
				return { success: false, error: 'session not found' };
			}
		} else {
			return { success: false, error: 'auth' };
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

	async profileslogin(req, res) {
		const { telegramId, password } = req.body;
		const isValidTId = telegramId && telegramId !== undefined;
		const isValidPassword = Boolean(password);

		if (isValidTId && isValidPassword) {
			// const sid = req.cookies[appConfig.SID_COOKIE_NAME];

			const { profile } = await database.queryProfile({ telegramId });
			const profileId = profile?.id;

			if (profile === null) {
				return { success: false, message: 'Profile not found' };
			}

			const isValidProfile = profile !== null;
			const isValidProfilePassword = profile.otp === password;

			if (isValidProfile && isValidProfilePassword) {
				const existSid = session.find((iData) => iData.profileId === profileId);

				if (existSid) {
					session.remove(existSid);
				}

				await database.updateProfile({ profileId }, { otp: null });
				const sid = session.add({ profileId: profileId, isAuth: true });
				const maxAge = 30 *24 *60 *60;
				// const maxAge = 90000
				res.cookie(appConfig.SID_COOKIE_NAME, sid, { maxAge, httpOnly: true });
				return { 
					success: true,
					profile: { id: profile.id },
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
		const sid = req.cookies[appConfig.SID_COOKIE_NAME];
		const sessionData = session.get(sid);

		if (sessionData && sessionData.profileId) {
			let orders = await database.queryProfileOrders(sessionData.profileId);

			orders = orders.sort((iO1, iO2) => iO2.date - iO1.date);
			orders.forEach((iOrder) => {
				if(Date.now() - iOrder.date > meta.ORDER_EXPIRY) {
					iOrder.isExpired = true;
				}
			});

			return { orders };
		} else {
			return { error: 'Invalid profileId' };
		}
	}

	// todo remove
	async profileslist(req, res) {
		return await database.queryProfiles();
	}
// orders
	async ordersplace(req, res) {
		const sid = req.cookies[appConfig.SID_COOKIE_NAME];
		const sessionData = session.get(sid);

		const { orderType, goodsId, amountType, price } = req.body;

		const isValidOrderType = meta.ORDER_TYPES.includes(orderType);
		const isValidGoods = database.goods.some((iGoods) => iGoods.id === goodsId);
		const isValidAmountType = meta.AMOUNT_TYPES.includes(amountType);
		const isValidPrice = price >= meta.MIN_ORDER_PRICE && price <= meta.MAX_ORDER_PRICE;

		if (!isValidPrice || !isValidGoods || !isValidOrderType || !isValidAmountType) {
			return { error: 'validation', isValidOrderType, isValidGoods, isValidAmountType, isValidPrice };
		}

		const order = await database.addOrder({
			profileId: sessionData.profileId,
			orderType,
			goodsId,
			amountType,
			price,
		});
	
		return { order: order, status: 'success' };
	}

	async ordersrevoke(req, res) {
		const sid = req.cookies[appConfig.SID_COOKIE_NAME];
		const sessionData = session.get(sid);
		let { orderId } = req.body;

		const order = await database.queryOrder(orderId);
		const isValidOrder = order !== null;
		if (!isValidOrder) {
			return { success: false, message: 'validation', isValidOrder }
		}

		if (order.profile.id !== sessionData.profileId) {
			return { success: false, message: 'Profile havet this order' }
		}

		const result = await database.removeOrder(orderId);

		return { success: true };
	}

	async ordersrenew(req, res) {
		const sid = req.cookies[appConfig.SID_COOKIE_NAME];
		const sessionData = session.get(sid);
		let { orderId } = req.body;

		const order = await database.queryOrder(orderId);
		const isValidOrder = order !== null;
		if (!isValidOrder) {
			return { success: false, message: 'validation', isValidOrder }
		}

		if (order.profile.id !== sessionData.profileId) {
			return { success: false, message: 'Profile havet this order' }
		}

		const result = await database.updateOrder({ orderId, date: Date.now() });
		result.isExpired = false;

		return { order: result };
	}

	async orderssearch(req, res) {
		let { orderType, text, goodsId, type, subType } = req.body;
		text = String(text).trim();

		// if (text === '') {
		// 	return { orders: [], count: 0 };
		// }

		const isValidOrderType = meta.ORDER_TYPES.includes(orderType);

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
			orders = orders
				.filter((iOrder) => Date.now() - iOrder.date <= meta.ORDER_EXPIRY)
				.sort((iO1, iO2) => iO2.date - iO1.date);

			return { orders: orders.slice(0, appConfig.MAX_ORDERS_IN_SEARCH), count: orders.length };
		} else {
			return { error: 'orders/search', orderType, text, goodsId, type, subType  };
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

	async _checkAuth(req) {
		const sid = req.cookies[appConfig.SID_COOKIE_NAME];

		if (sid) {
			const sessionData = session.get(sid);
			return sessionData !== undefined && sessionData.isAuth;
		} else {
			return false;
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
				const isAuth = await this._checkAuth(req);
				if (!isAuth) {
					res.send(JSON.stringify({ success: false, error: 'Auth failed' }));
					return;
				}
			}
// console.log('action call', action);
			const method = req.method;
			const url = req.url;
			console.log(`[${time()}] ${method} ${url}`);

			const statValue = database.statistics[url];
			database.statistics[url] = statValue ? statValue + 1 : 1;

			const result = await this[action].call(this, req, res);
			const data = JSON.stringify(result);
	
			res.send(data);
		};
	}
};


module.exports.mapi = new CMapi();
