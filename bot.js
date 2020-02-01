const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const config = require('./config.json')

client.login(auth.token);

client.on('ready', () =>{
	console.log('Logged in as ' + client.user.tag);
});

client.on('message', message => {
	config.users_to_hate.forEach(evaluateMessage);

	function evaluateMessage(hated_user, index) {

		if (message.author.username === hated_user.username){
			const nickname = message.author.lastMessage.member.nickname
			const reactionFilter = (reaction, user) => {
				return reaction.emoji.name ===config.reaction.to_watch && user.username === hated_user.username;		
			};

			message.awaitReactions(reactionFilter, {max: 1, time: config.message_watch_time, errors: ['time']})
				.then(collected => {
					const replyMessage = config.reaction.messages[Math.floor(Math.random()*config.reaction.messages.length)].replace('{nickname}', nickname);
					message.reply(replyMessage);
				})
				.catch(collected => {
					console.log(`${nickname} did not upvote themselves`)
				});
		}
	}
});

