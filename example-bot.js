const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const fs = require('fs');
const logfile = "joke_logs.txt"

var jokeUser = "";
var jokeStage = 0;
var jokeContent = "";

var blacklistedNames = ["John", "James"];
var whitelistedRoles = ["Admin"];

client.on('ready', () => {
  console.log(`Logged in successfully`);
});

client.on('message', msg => {
  var jokeStart = RegExp('knock knock*', 'i');
	
	var blacklisted = false;
	for (let name of blacklistedNames) {
		if (msg.author.name == name) {
			blacklisted = true;
		}
	}
	if (blacklisted) return;
	
	var whitelisted = false
	for (let role of whitelistedRoles) {
		if (msg.author.roles.includes(role)) {
			whitelisted = true;
		}
	}
	if (!whitelisted) return;
  
  // if command detected and no jokes in progress
  if (jokeStart.test(msg.content) && !jokeStage) {
		msg.reply(`Who's there?`);
		
		// acknowledge that a joke has started, remember the user who started it
		jokeUser = msg.author.id;
		jokeStage = 1;
	
		// if the user has not continued the joke in 10 seconds, allow a new joke to start
		setTimeout(() => {if (jokeStage === 1) {
			jokeStage = 0;
			jokeUser = "";
			jokeContent = "";
		}}, 1e4)
  }
  
  // if message sent by the user who has just started a joke
  else if (jokeStage === 1 && jokeUser === msg.author.id) {
		msg.reply(msg.content + " who?");
		
		// store what they said to reference later
		jokeContent = msg.content;
	  jokeStage = 2;
		
		// if the user has not continued the joke in 10 seconds, allow a new joke to start
		setTimeout(() => {if (jokeStage === 2) {
			jokeStage = 0;
			jokeUser = "";
			jokeContent = "";
		}}, 1e4)
  }
	
	// if message is sent by user who started the joke
	else if (jokeStage === 2 && jokeUser === msg.author.id) {
		
		// if their punchline makes sense with the rest of the joke
		if (msg.content.toLowerCase().includes(jokeContent.toLowerCase())) {
			// log completed joke
			fs.appendFile(logfile, msg.content + ";", (err) => {
				if (err) throw err;
			});
			
			fs.readFile(logfile, (err, data) => {
				if (err) throw err;
				console.log(data);
				
				var saidBefore = false;
				var previousJokes = data.split(";");
				
				// for every previous good joke told
				for (let joke of previousJokes) {
					
					// if it is not equal to the current joke
					if (joke.trim().toLowerCase() != msg.content.trim().toLowerCase()) {
						msg.reply("Oh that sure was a good one");
					} // otherwise its old news
					else {
						msg.reply("I've heard that one before");
					}
				}
			});
		}
		else {
			msg.reply("I don't get it");
		}
		
		// reset the command on joke completion
		jokeStage = 0;
		jokeUser = "";
		jokeContent = "";
	}
});

client.login(auth.token);