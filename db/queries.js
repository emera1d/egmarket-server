const DB_TABLES = `
	SELECT table_name
	FROM information_schema.tables
	WHERE table_schema = 'public'
	ORDER BY table_name;
`;

/* PROFILES */
const PROFILES_CREATE = `CREATE TABLE IF NOT EXISTS "PROFILES" (
	id SERIAL,
	reg_date bigint,
	telegram_id bigint,
	username text,
	otp varchar(32),
	sid varchar(64),
	is_auth boolean,
	PRIMARY KEY ("id")
);`;


const PROFILES_INSERT = `
INSERT INTO "PROFILES" 
	( "reg_date", "telegram_id", "username", "otp" )
VALUES
	( $1, $2, $3, $4 )
`;

const PROFILES_SELECT = `SELECT * FROM "PROFILES"`;
const PROFILES_SELECT_COUNT = `SELECT COUNT(*) FROM "PROFILES"`;
const PROFILES_SELECT_BY_PID = `SELECT * FROM "PROFILES" WHERE id = $1`;
const PROFILES_SELECT_BY_TID = `SELECT * FROM "PROFILES" WHERE telegram_id = $1`;
const PROFILES_SELECT_BY_SID = `SELECT * FROM "PROFILES" WHERE sid = $1`;

const PROFILES_UPDATE_BY_PID_OTP = `
	UPDATE "PROFILES"
	SET sid = $1, is_auth = $2, otp = $3
	WHERE id = $4;
`;

const PROFILES_UPDATE_BY_TID = `
	UPDATE "PROFILES"
	SET otp = $1
	WHERE telegram_id = $2;
`;

/* ORDERS */
const ORDERS_CREATE = `CREATE TABLE IF NOT EXISTS "ORDERS" (
	id SERIAL,
	date bigint,
	profile_id bigint,
	telegram_id bigint,
	username text,
	order_type smallint,
	goods_id integer,
	amount_type smallint,
	price integer
);`;

const ORDERS_INSERT = `
INSERT INTO "ORDERS" 
	( date, profile_id, telegram_id, username, order_type, goods_id, amount_type, price )
VALUES
	( $1, $2, $3, $4, $5, $6, $7, $8 )
`;

const ORDERS_SELECT = `SELECT * FROM "ORDERS"`;
// const ORDERS_SELECT_COUNT = `SELECT COUNT(*) FROM "ORDERS"`;
const ORDERS_SELECT_COUNT_BY_PID = `SELECT COUNT(*) FROM "ORDERS" WHERE profile_id = $1`;
const ORDERS_SELECT_BY_PID = `SELECT * FROM "ORDERS" WHERE profile_id = $1`;
const ORDERS_SELECT_SEARCH = `SELECT * FROM "ORDERS" WHERE order_type = $1 AND goods_id = ANY ($2)`;
const ORDERS_SELECT_LAST = `
	SELECT * FROM "ORDERS"
	WHERE order_type = $1
	ORDER BY date DESC
	LIMIT $2;
`;
const DELETE_ORDER_BY_OID = `DELETE FROM "ORDERS" WHERE id = $1 AND profile_id = $2`;
const ORDERS_UPDATE = `
	UPDATE "ORDERS"
	SET date = $1
	WHERE profile_id = $2 AND id = $3;
`;

/* STATISTICS */
const STATISTICS_CREATE = `CREATE TABLE IF NOT EXISTS "STATISTICS" (
	id SERIAL,
	date bigint,
	statistics text
);`;
// 	CONSTRAINT uniq_date UNIQUE ( date )

// const STATISTICS_FLUSH = `
// INSERT INTO "STATISTICS" ( date, statistics )
// VALUES ( $1, $2 )
// ON CONFLICT (id) DO UPDATE 
// 	SET date = excluded.date, 
// 	statistics = excluded.statistics;
// `
const STATISTICS_SELECT = `SELECT * FROM "STATISTICS"`;
const STATISTICS_SELECT_BY_DATE = `SELECT * FROM "STATISTICS" WHERE date = $1`;
const STATISTICS_SELECT_LAST = `
	SELECT * FROM "STATISTICS" 
	ORDER BY date DESC
	LIMIT 1
`;
const STATISTICS_INSERT = `INSERT INTO "STATISTICS" ( date, statistics ) VALUES ( $1, $2 )`;
const STATISTICS_UPDATE = `UPDATE "STATISTICS" SET date = $1, statistics = $2 WHERE date = $1;`;
const STATISTICS_TRUNCATE = `TRUNCATE "STATISTICS"`;

// MODULE
module.exports.SYSTEM = {
	TABLES: DB_TABLES
};

module.exports.ORDERS = {
	CREATE: ORDERS_CREATE,
	INSERT: ORDERS_INSERT,
	SELECT: ORDERS_SELECT,
	// SELECT_COUNT: ORDERS_SELECT_COUNT,
	SELECT_COUNT_BY_PID: ORDERS_SELECT_COUNT_BY_PID,
	SELECT_BY_PID: ORDERS_SELECT_BY_PID,
	SELECT_SEARCH: ORDERS_SELECT_SEARCH,
	SELECT_LAST: ORDERS_SELECT_LAST,
	UPDATE: ORDERS_UPDATE,
	DELETE_BY_OID: DELETE_ORDER_BY_OID,
};

module.exports.PROFILES = {
	CREATE: PROFILES_CREATE,
	INSERT: PROFILES_INSERT,
	SELECT: PROFILES_SELECT,
	SELECT_COUNT: PROFILES_SELECT_COUNT,
	SELECT_BY_PID: PROFILES_SELECT_BY_PID,
	SELECT_BY_TID: PROFILES_SELECT_BY_TID,
	SELECT_BY_SID: PROFILES_SELECT_BY_SID,
	UPDATE_BY_PID_OTP: PROFILES_UPDATE_BY_PID_OTP,
	UPDATE_BY_TID: PROFILES_UPDATE_BY_TID,
};

module.exports.STATISTICS = {
	CREATE: STATISTICS_CREATE,
	// FLUSH: STATISTICS_FLUSH,
	SELECT: STATISTICS_SELECT,
	SELECT_BY_DATE: STATISTICS_SELECT_BY_DATE,
	SELECT_LAST: STATISTICS_SELECT_LAST,
	INSERT: STATISTICS_INSERT,
	UPDATE: STATISTICS_UPDATE,
	TRUNCATE: STATISTICS_TRUNCATE,
};
