const { Events } = require('discord.js');
const { openDb } = require('../handlers/databaseHandler.js');
const fs = require("fs");


module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		db = await openDb();
		const schema = fs.readFileSync("./schema.sql").toString();
		const schemaArr = schema.toString().split(");");

		db.getDatabaseInstance().serialize(() => {
			db.run("PRAGMA foreign_keys=OFF;");
			schemaArr.forEach((query) => {
			  if (query) {
				query += ");";
				db.run(query);
			  }
			});
		});


		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};