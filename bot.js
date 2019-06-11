const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  // console.log('msg sent');
  var prefix ='!';
  var msg = message.content.toLowerCase();
  var sender = message.author;
  var command = message.content.slice(prefix.length).split(" ");
  var args = command.slice(1);

  if (msg.startsWith(prefix+"purge")) {
  // msg.reply('Pong!');
    //message.delete();
    async function purge(){
      

      if(message.author.username != "EnderRao"){
        return;
      }

      if (isNaN(args[0])){
        message.channel.send('Usage: ' + prefix + 'purge <amount>');
        return;
      }

      var del = parseInt(args[0])+1;
      const fetched = await message.channel.fetchMessages({limit: del});
      console.log(fetched.size + ' messages are being deleted');

      message.channel.bulkDelete(fetched)
        .catch(error => message.channel.send(`Error: $(error)`));

    }
    purge();
	
  }
});


client.login('NTg3MzUzNzI5NjE5OTg0NDE1.XP1XKg.-utF1aeBqUnI-j97hkTZJx8TYGs');