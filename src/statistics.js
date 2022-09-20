// const uuid = require('uuid');
const { debounce } = require('./utils/timer');

// const FLUSH_DELAY = 1 *60 *1000;
const FLUSH_DELAY = 1 *1000;

class CStatistics {

	constructor() {
		this.statistics = {};
		this.__flush = debounce(this._flush.bind(this), FLUSH_DELAY);

		// setInterval(() => console.log(Object.keys(this.statistics)), 2000);
	}

	init(data) {
		const date = this.makeDate();
		if (data.date === date && data.statistics) {
			this.statistics[date] = data.statistics; // TODO merge
		} else {
			this.statistics[date] = {};
		}
	}

	push(tag) {
		const date = this.makeDate();

		if (!this.statistics[date]) {
			this.statistics[date] = {};
		}

		const stats = this.statistics[date];
		const statValue = stats[tag];
		stats[tag] = statValue ? statValue + 1 : 1;

		this.__flush();
	}

	on(events) {
		this.events = events;
	}

	view() {
		const date = this.makeDate();

		return JSON.stringify(this.statistics[date]);
	}

	_flush() {
		if (this.events.onFlush) {
			const todayDate = this.makeDate();
			const keys = Object.keys(this.statistics);

			// flush all stats
			keys.forEach((iDate) => {
				this.events.onFlush({ date: Number(iDate), statistics: this.statistics[iDate] });
			})

			// find keys to remove
			const toRemove = keys.filter((iDate) => {
				return Number(iDate) !== todayDate;
			});

			// Clear old stats
			toRemove.forEach((iDate) => {
				delete this.statistics[iDate];
			});
		}
	}

	makeDate() {
		const today = new Date();
		const date = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

		return date;
	}
}

module.exports.CStatistics = CStatistics;
