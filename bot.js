const Discord = require('discord.js');
const client = new Discord.Client();
var fs = require('fs');
var filterList = [];
var filter = false;


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  var fileContents = fs.readFileSync('./words.txt', 'utf8');
  filterList = JSON.parse(fileContents);
  var fileContents2 = fs.readFileSync('./filterSwitch.txt', 'utf8');
  filter = JSON.parse(fileContents2);
  //console.log(filterList);
});

client.on('message', message => {
  //setting up variables
  var prefix ='!';
  var msg = message.content.toLowerCase();
  var sender = message.author;
  var command = message.content.slice(prefix.length).split(" ");
  var args = command.slice(1);

  
  if(msg.startsWith(prefix+"filter")){
    if(!(message.member.hasPermission("ADMINISTRATOR"))){
      message.reply('Insufficient permissions');
      return;
    }
    if((args.length < 1) || (args.length > 2)){
      message.channel.send('Usage:\n'+ prefix + 'filter show\n' + prefix + 'filter enable\n' + prefix + 'filter disable\n' + prefix + 'filter add <word>\n' + prefix + 'filter remove <word>');
      return;
    }
    if(args[0].toLowerCase() === 'add'){
      addToFilter(args[1].toLowerCase(), message);
    }
    else if(args[0].toLowerCase() === 'remove'){
      removeFromFilter(args[1].toLowerCase(), message);
    }
    else if(args[0].toLowerCase() === 'show'){
      showList(message);
    }
    else if(args[0].toLowerCase() === 'enable'){
      filter = true;
      message.reply("Message filter enabled");
      var file = fs.createWriteStream('filterSwitch.txt');
      file.write(JSON.stringify(filter));
    }
    else if(args[0].toLowerCase() === 'disable'){
      filter = false;
      message.reply("Message filter disabled");
      var file = fs.createWriteStream('filterSwitch.txt');
      file.write(JSON.stringify(filter));
    }
    else{
      message.channel.send('Usage:\n'+ prefix + 'filter show\n' + prefix + 'filter enable\n' + prefix + 'filter disable\n' + prefix + 'filter add <word>\n' + prefix + 'filter remove <word>');
      return;
    }
  }

  else if (msg.startsWith(prefix+"purge")) {
    async function purge(){
      //check to mnake sure EnderRao is the one purging
      if(!(message.member.hasPermission("ADMINISTRATOR"))){
        message.reply('Insufficient permissions');
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
      else{
        message.channel.send('Usage:\n' + prefix + 'purge <amount>\n' + prefix + 'purge <amount> <@user>');
        return;
      }
    }
    purge();
  }

  else{
    if(message.member.roles.find(r => r.name === "ChatMod")){
      return;
    }
    if(filter){
      for(var i = 0; i < filterList.length; i++){
        var word = filterList[i];
        var regex = new RegExp(word,"i");
        if(message.content.match(regex)){
          console.log('detected '+filterList[i]);
          message.reply("Don't say that!");
          message.delete();
          return;
        }
      }
    }
  }

});

function addToFilter(word, message){
  for(var i = 0; i < filterList.length;i++){
    if(filterList[i] === word){
      return;
    }
  }
  filterList.push(word);
  console.log('Added '+word+' to filter list.');
  message.channel.send('Added new word to filter list');

  var file = fs.createWriteStream('words.txt');
  file.write(JSON.stringify(filterList));
}

function removeFromFilter(word, message){
  for( var i = 0; i < filterList.length; i++){ 
    if ( filterList[i] === word) {
      filterList.splice(i, 1);
      console.log('Removed '+word+' from filter list.');
      message.channel.send('Removed word from filter list');
      i--;
    }
  }
  var file = fs.createWriteStream('words.txt');
  file.write(JSON.stringify(filterList));
}

function showList(message){
  var words = "[";
  for(var i = 0; i < filterList.length; i++){
    if(i == filterList.length-1){
      words = words + filterList[i]+']';
    }
    else{
      words = words + filterList[i]+", ";
    }
  }
  if(filterList.length == 0){
    words = "[]";
  }
  if(filter){
    message.channel.send('Filter list (enabled):\n'+words);
  }
  else{
    message.channel.send('Filter list (disabled):\n'+words);
  }
}

client.login(process.env.BOT_TOKEN);
