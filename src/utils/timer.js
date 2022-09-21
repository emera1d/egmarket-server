module.exports.debounce = (fn, delay) => {
	let tid;

	const process = () => {
		clearTimeout(tid);
		tid = setTimeout(() => {
			fn();
		}, delay || 1000);
	};

	process.stop = () => clearTimeout(tid);

	return process;
};
