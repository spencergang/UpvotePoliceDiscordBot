const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const config = require('./config.json')

client.login(auth.token);

client.on('ready', () =>{
	console.log('Logged in as ' + client.user.tag);
});

client.on('message', message => {
	var username = message.author.username;
	var nickname = message.author.lastMessage.member.nickname;
	var reactionWatchTime = config.reaction.toWatch;
	var reactionWatchTime = config.reaction.watchTime;
	var responseMessages = config.reaction.messages;

	const reactionFilter = (reaction, user) => {
		return reaction.emoji.id === config.reaction.toWatch && user.username === username;
	};

	message.awaitReactions(reactionFilter, {max: 1, time: reactionWatchTime, errors: ['time']})
		.then(collected => {
			console.log(`${nickname} (${username}) upvoted themselves.`)
			const replyMessage = config.reaction.messages[Math.floor(Math.random()*config.reaction.messages.length)].replace('{nickname}', nickname);
			message.reply(replyMessage);
		})
		.catch(collected => {
			console.log(`${nickname} (${username}) did not upvote themselves.`)
		});
});

