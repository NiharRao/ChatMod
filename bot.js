const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  //setting up variables
  var prefix ='!';
  var msg = message.content.toLowerCase();
  var sender = message.author;
  var command = message.content.slice(prefix.length).split(" ");
  var args = command.slice(1);

  if(message.content.match(/test/i)){
    message.reply('found!');
    message.delete();
    return;
  }

  if (msg.startsWith(prefix+"purge")) {
    async function purge(){
      //check to mnake sure EnderRao is the one purging
      if(sender.username != "EnderRao"){
        return;
      }

      //check if amount is a number
      if (isNaN(args[0])){
        message.channel.send('Usage:\n' + prefix + 'purge <amount>\n' + prefix + 'purge <amount> <@user>');
        return;
      }

      //console.log(args[1].substring(2,args[1].length-1));
      //console.log(message.author.id);
      //message.channel.send("test "+args[1]);
      var del = parseInt(args[0])+1;
      if (del > 100){
        del = 100;
      }
      else if(del < 1){
        message.channel.send('Amount must be greater than 0');
        return;
      }
      //delete N messages
      if(args.length == 1){
        
        const fetched = await message.channel.fetchMessages({limit: del});
        console.log(fetched.size-1 + ' messages are being deleted');

        message.channel.bulkDelete(fetched)
          .catch(error => console.log('Error: '+error));
      }
      //delete N messages from user
      else if(args.length == 2){

        //delete command message (message.delete() has inconsistencies)
        const fetched = await message.channel.fetchMessages({limit: 1});
        message.channel.bulkDelete(fetched)
          .catch(error => console.log('Error: '+error));

        //filter by user ID
        message.channel.fetchMessages().then(messages => {
          messages = messages.filter(msg => msg.author.id === args[1].substring(2,args[1].length-1)).array().slice(0,del-1);
          console.log(messages.length + ' messages are being deleted');

          message.channel.bulkDelete(messages)
          .catch(error => console.log('Error: '+error));

        }).catch(error => {
          console.log('Error: '+error);
        });
      }
    }
    purge();
  }


});


client.login(process.env.BOT_TOKEN);