// const INSERT_SESSIONS = `CREATE TABLE IF NOT EXISTS "SESSIONS" (
// 	sid text,
// 	profile_id bigint,
// 	is_auth boolean
// );`;

const INSERT_PROFILES = `
INSERT INTO "PROFILES" 
	( "reg_date", "telegram_id", "username", "otp" )
VALUES
	($1, $2, $3, $4)
`;

// const INSERT_ORDERS = `CREATE TABLE IF NOT EXISTS "ORDERS" (
// 	id SERIAL,
// 	date bigint,
// 	profile_id bigint
// 	order_type smallint,
// 	goods_id bigint,
// 	amount_type smallint,
// 	price bigint,
// );`;

// const SELECT_SESSIONS = `CREATE TABLE IF NOT EXISTS "SESSIONS" (
// 	sid text,
// 	profile_id bigint,
// 	is_auth boolean
// );`;

const SELECT_PROFILES = `SELECT * FROM "PROFILES"`;
const SELECT_PROFILES_BY_PID = `SELECT * FROM "PROFILES" WHERE id = $1`;
const SELECT_PROFILES_BY_TID = `SELECT * FROM "PROFILES" WHERE telegram_id = $1`;

// const SELECT_ORDERS = `CREATE TABLE IF NOT EXISTS "ORDERS" (
// 	id SERIAL,
// 	date bigint,
// 	profile_id bigint
// 	order_type smallint,
// 	goods_id bigint,
// 	amount_type smallint,
// 	price bigint,
// );`;

// module.exports.INSERT_SESSIONS = INSERT_SESSIONS;
module.exports.INSERT_PROFILES = INSERT_PROFILES;
// module.exports.INSERT_ORDERS = INSERT_ORDERS;

// module.exports.SELECT_SESSIONS = SELECT_SESSIONS;
module.exports.SELECT_PROFILES = SELECT_PROFILES;
module.exports.SELECT_PROFILES_BY_TID = SELECT_PROFILES_BY_PID;
module.exports.SELECT_PROFILES_BY_TID = SELECT_PROFILES_BY_TID;
// module.exports.SELECT_ORDERS = SELECT_ORDERS;
