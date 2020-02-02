const Discord = require('discord.js');
const discordClient = new Discord.Client();
const mongoClient = require('mongodb').MongoClient
const auth = require('./auth.json');
const config = require('./config.json')


const uri = config.database.uri;
const dbClient = new mongoClient(uri, { useNewUrlParser: true });
discordClient.login(auth.token);

function updateUpvoteRecord(username, reactionMessage) {
	dbClient.connect(err => {
  	const collection = dbClient.db("upvote_police_bot").collection("self_upvotes");
  	var today = new Date();

		var query = {
			day: today.getDate(),
			month: today.getMonth(),
			year: today.getFullYear(),
			username: username
		};

		collection.find(query).toArray(function(err, result){
			if (err) throw err;

			if (result.length > 0)
			{
				console.log(result[0]);
				const newCount = ++result[0].count;
				const newValues = { $set: { count: newCount }};

				collection.updateOne(query, newValues, function(err, res){
					if (err) throw err;
					console.log(`${username} record updated.`);
					reactionMessage.channel.send(`Todays self-upvote count for ${username}: ${newCount}`)
				});
			}
			else {
				const insertRecord = {
					date: today,
					day: today.getDate(),
					month: today.getMonth(),
					year: today.getFullYear(),
					username: username,
					count: 1
				};

				collection.insertOne(insertRecord, function(err, res){
					if (err) throw err;
					console.log(`${username} record inserted`);
					reactionMessage.channel.send(`Todays self-upvote count for ${username}: 1`)
				});
			}
		});
	});
}

discordClient.on('ready', () =>{
	console.log('Logged in as ' + discordClient.user.tag);
});

discordClient.on('messageReactionAdd', (reaction, user) => {
	var messageUsername = reaction.message.author.username;
	var reactionUsername = reaction.users.first().username;
	var emojiId = reaction.emoji.id;
	var emojiToWatchId = config.reaction.toWatch;

	var sameUsername = messageUsername === reactionUsername;
	var correctEmoji = emojiId === emojiToWatchId;

	if (sameUsername && correctEmoji)
	{
		const replyMessage = config.reaction.messages[Math.floor(Math.random()*config.reaction.messages.length)];
		reaction.message.reply(replyMessage);
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
            discordClient.emit('messageReactionAdd', reaction, discordClient.users.get(packet.d.user_id));
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            discordClient.emit('messageReactionRemove', reaction, discordClient.users.get(packet.d.user_id));
        }
    });
});