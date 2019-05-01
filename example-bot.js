const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

var jokeUser = "";
var jokeStage = 0;
var jokeContent = "";

client.on('ready', () => {
  console.log(`Logged in successfully`);
});

client.on('message', msg => {
  var jokeStart = RegExp('knock knock*', 'i');
  
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
			msg.reply("Oh that sure was a good one");
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