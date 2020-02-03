const Discord = require('discord.js');
const discordClient = new Discord.Client();
const auth = require('./auth.json');
const config = require('./config.json')
const DatabaseDriver = require('./databaseDriver');
const dbDriver = new DatabaseDriver();

discordClient.login(auth.token);

async function updateUpvoteRecord(username, reactionMessage) {
	var existingRecords = await dbDriver.getUpvoteRecords(username);
	var today = new Date();
	var todaysRecords = existingRecords.filter(function (record){
		return record.day === today.getDate() && record.month == today.getMonth() && record.year == today.getFullYear();
	});
	if (todaysRecords.length) {
		const newCount = ++todaysRecords[0].count;
		dbDriver.updateCount(todaysRecords[0]._id, newCount);

		if (newCount > 0 && newCount % config.reaction.alarmCount === 0) {
			reactionMessage.channel.send(`WEE WOO WEE WOO FUCK BOY ALERT WEEE WOO WEE WOO ${config.reaction.alarmGifLink}`)
		}
		reactionMessage.channel.send(`Todays self-upvote count for ${username}: ${newCount}`)
	}
	else {
		const newRecord = {
			date: today,
			day: today.getDate(),
			month: today.getMonth(),
			year: today.getFullYear(),
			username: username,
			count: 1
		}
		dbDriver.insertNewUpvoteRecord(newRecord);
		reactionMessage.channel.send(`Todays self-upvote count for ${username}: ${newRecord.count}`)
	}
}

discordClient.on('ready', () =>{
	console.log('Logged in as ' + discordClient.user.tag);
});

discordClient.on('messageReactionAdd', (reaction, author, user) => {
	var messageUsername = reaction.message.author.username;
	var reactionUsername = reaction.users.first().username;
	var emojiId = reaction.emoji.id;
	var emojiToWatchId = config.reaction.toWatch;

	console.log(`Message Creator: ${messageUsername}`);
	console.log(`Reaction Creator: ${reactionUsername}`);
	console.log(`Reaction Emoji Id: ${emojiId}`);
	var sameUsername = messageUsername === reactionUsername;
	var correctEmoji = emojiId === emojiToWatchId;

	if (sameUsername && correctEmoji)
	{
		const replyMessage = config.reaction.messages[Math.floor(Math.random()*config.reaction.messages.length)];
		reaction.message.channel.send(`${author} ${replyMessage}`);
		updateUpvoteRecord(reactionUsername, reaction.message);
	}
});

discordClient.on('raw', packet => {
    // We don't want this to run on unrelated packets
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    // Grab the channel to check the message from
    const channel = discordClient.channels.get(packet.d.channel_id);
    // There's no need to emit if the message is cached, because the event will fire anyway for that
    if (channel.messages.has(packet.d.message_id)) return;
    // Since we have confirmed the message is not cached, let's fetch it
    channel.fetchMessage(packet.d.message_id).then(message => {
        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        const reaction = message.reactions.get(emoji);
        // Adds the currently reacting user to the reaction's users collection.
        if (reaction) reaction.users.set(packet.d.user_id, discordClient.users.get(packet.d.user_id));
        // Check which type of event it is before emitting
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            discordClient.emit('messageReactionAdd', reaction, message.author,  discordClient.users.get(packet.d.user_id));
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            discordClient.emit('messageReactionRemove', reaction, message.author, discordClient.users.get(packet.d.user_id));
        }
    });
});