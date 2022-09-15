module.exports = {
	ping: () => ({ name: 'mapi', ping: true, ts: Date.now() }),
	root: () => ({ name: 'mapi', version: '1.0.0' }),
};
