const mongoClient = require('mongodb').MongoClient;
const config = require('./config.json');

class DatabaseDriver {
	constructor() {
		this.dbClient = new mongoClient(config.database.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		this.dbClient.connect();
	}

	async getUpvoteRecords(username) {
		const collection = this.dbClient.db(config.database.databaseName).collection(config.database.collectionName);
		const existingRecords = await collection.find({ username: username }).toArray();
		return existingRecords;
	}

	async updateCount(id, newCount) {
		const collection = this.dbClient.db(config.database.databaseName).collection(config.database.collectionName);
		const query = { _id: id };
		const newValues = { $set: { count: newCount }};
		await collection.updateOne(query, newValues);
	}

	async insertNewUpvoteRecord(newRecord) {
		const collection = this.dbClient.db(config.database.databaseName).collection(config.database.collectionName);
		await collection.insert(newRecord);
	}
}

module.exports = DatabaseDriver;