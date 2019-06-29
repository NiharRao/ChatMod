const Discord = require('discord.js');
const client = new Discord.Client();
var fs = require('fs');
var filterList = [];
var filter = false;
var cmChannel = false;
var cmID;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  var val;
  val = client.channels.find(channel => channel.name === 'chatmod-channel');
  if(val){
    cmID = val.id;
    console.log('Channel found');
    fillFilter(val);
   

    cmChannel = true;
  }
  else{
    cmChannel = false; 
    console.log('Channel not found...creating channel now');
    val = client.channels.find(channel => channel.name === 'general');
    // console.log(val.id);
    client.channels.get(val.id).send('cm.channel.creation');
  }
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
      var val =  client.channels.find(channel => channel.name === 'chatmod-channel');
      client.channels.get(val.id).send(listString(message));
    }
    else if(args[0].toLowerCase() === 'disable'){
      filter = false;
      message.reply("Message filter disabled");
      var val =  client.channels.find(channel => channel.name === 'chatmod-channel');
      client.channels.get(val.id).send(listString(message));
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
      if(message.channel.name === 'general'){
        if(message.content === 'cm.channel.creation'){
          cmChannelCreation(message);
        }
      }
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


client.on('channelDelete', channel => {
  if(channel.id === cmID){
    val = client.channels.find(channel => channel.name === 'general');
    client.channels.get(val.id).send('cm.channel.creation');
  }
});


function cmChannelCreation(message){
  message.delete(1000);
  var roleAll = message.guild.roles.find(r => r.name === "@everyone");
  var roleCM = message.guild.roles.find(r => r.name === "ChatMod");
  var val;
  message.guild.createChannel('chatmod-channel',{
    type: 'text' ,
    permissionOverwrites:[
    {
      type: 'role',
      id: roleAll.id,
      deny:3072
    },
    {
      type: 'role',
      id: roleCM.id,
      allow:11264
    }
    ]
  })
           
  .then(()=> val =  client.channels.find(channel => channel.name === 'chatmod-channel'))
  .then(()=> client.channels.get(val.id).send(listString(message)))
  ;

  cmID = val.id;
  cmChannel = true;
}

function addToFilter(word, message){
  for(var i = 0; i < filterList.length;i++){
    if(filterList[i] === word){
      return;
    }
  }
  filterList.push(word);
  console.log('Added '+word+' to filter list.');
  message.channel.send('Added new word to filter list');

  var val =  client.channels.find(channel => channel.name === 'chatmod-channel');
  client.channels.get(val.id).send(listString(message));
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
  var val =  client.channels.find(channel => channel.name === 'chatmod-channel');
  client.channels.get(val.id).send(listString(message));
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

function listString(message){
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
    words = 'Filter list (enabled):\n'+words;
  }
  else{
    words = 'Filter list (disabled):\n'+words;
  }
  return words;
}

function fillFilter(channel){
  var val = channel;
  val.fetchMessages({ limit: 1 }).then(messages => {
    let lastMessage = messages.first();
    var contents = lastMessage.content.split(" ");
    var contents2 = contents[2].split(":\n");
    if(contents2[0] === "(disabled)"){
      filter = false;
    }
    else{
      filter = true;
    }
    filterList = JSON.parse(contents2[1]);
  
  })
  .catch(console.error);
}

client.login(process.env.BOT_TOKEN);
// client.login("");
