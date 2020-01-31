const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const config = require('./config.json')

client.on('ready', () =>{
	console.log('Logged in as ' + client.user.tag);
});

client.on('message', msg => {
	console.log(msg.member.user);
	if (msg.content === 'ping'){
		msg.reply('pong');
	}
});

client.login(auth.token);