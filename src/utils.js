const locale = 'en';
module.exports.time = () => {
	const ts = Date.now();
	const options = {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		// timeStyle: 'short' // full long medium short
	};

	return new Date(ts).toLocaleTimeString(locale, options); // TODO localization
};