const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('Logged in as ${client.user.tag}!');
});

client.on('message', msg => {
	//console.log('msg sent');
  if (msg.content === '!ping') {
    //msg.reply('Pong!');
	msg.delete();
	console.log('msg deleted');
	
  }
});


client.login('NTg3MzUzNzI5NjE5OTg0NDE1.XP1XKg.-utF1aeBqUnI-j97hkTZJx8TYGs');