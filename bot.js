const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const config = require('./config.json')

client.login(auth.token);

client.on('ready', () =>{
	console.log('Logged in as ' + client.user.tag);
});

client.on('message', msg => {
	if (msg.author.username === config.user_to_hate.username) {
		console.log("user to hate sent message");
		const filter = (reaction, user) => {
			return reaction.emoji.name === config.reaction_to_watch && user.username === config.user_to_hate.username;
		};

		msg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
			.then(collected => {
				msg.reply("You dumb bitch " + config.user_to_hate.friendly_name + ", you shouldn't upvote yourself");
			})
			.catch(collected => {
				console.log("Wow, they didn't upvote themselves!");
			});
	}
});

