import telegramService from "./services/telegramService";

// require("dotenv").config();

// telegramService.telegram.on("message", async ({ from, text: twitterUsername }) => {
// 	console.log(from.id, from.username);

// 	await telegramService.telegram.sendMessage(userId, message);

// 	// await telegramService.telegram.sendMessage(from.id, noMsg, {
// 	// 	parse_mode,
// 	// 	reply_markup: {
// 	// 	keyboard: [[{ text: msg.ihavedoneitall }]],
// 	// 	},
// 	// });

// });


// telegramService.telegram.onText(/\/start/, async ({ from } : IWithUser) => {
// 	let text = "";
// 	const campaign = config.get().CAMPAING;

// 	if (campaign === "1" || campaign === "2") {
// 	text = msg.reqForParticipate;
// 	} else {
// 	text = `${msg.allCompaniesAreFinished}\n`;
// 	}
// 	try {
// 	await telegramService.telegram.sendMessage(from.id, text, {
// 		parse_mode,
// 		reply_markup: {
// 		keyboard: [[{ text: msg.ihavedoneitall }]],
// 		},
// 	});	
// 	} catch (e) {
// 	console.log(e);
// 	} 
// });

// telegramService.telegram.onText(/I've done it all!/, async ({ from }) => {
// 	try {
// 		await telegramService.telegram.sendMessage(from.id, msg.triggerCheck, {
// 			parse_mode,
// 			reply_markup: {
// 			remove_keyboard: true,
// 			},
// 		});		
// 	} catch (e) {
// 		console.log(e);
// 	}
// });
