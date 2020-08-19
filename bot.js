var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var randomPuppy = require('random-puppy');
var fs = require('fs');
var allMVs = JSON.parse(fs.readFileSync('mvs.json', 'utf8'));
var allMem = JSON.parse(fs.readFileSync('4648.json', 'utf8'));
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `_`
    if(user !== 'Pyokonin' && message[0] !== '_'){
        console.log(user+': '+message + ' in '+channelID);
        bot.sendMessage({
            to: "503280022493069312",
            message: '`'+user+':` '+ message
        });
        bot.sendMessage({
            to: "503283358940266497",
            message: '`'+user+':` '+ message
        });
    }
    if (message.substring(0, 1) == '_') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {

            /* _ping
             * Used by creator to check if bot is live
             */ 
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong! -- *Coded with JScript*'
                });
            break;






            // _help
            case 'help':
                    bot.sendMessage({
                    to: userID,
                    message: 'List of commands: `_ask, _roll, _choose, _cat, _meme, _dankmeme, _mv`\r'
                    +'`_ask:` ask a yes/no question. Eg. _ask are you happy?'
                    +'\r`_roll:` roll dice of a number of your liking. Eg. _roll 20'
                    +'\r`_choose:` choose from a list of your items by random, separated by commas. Eg. _choose dog, cat, memes'
                    +"\r`_cat, _meme, _dankmeme:` gets a random image from imgur's subreddit; cat, meme, dankmemes respectively."
                    +'\r`_mv, _mv list, _mv "group name":` `_mv` retrieves random MV from database. `_mv list` view list of available groups in database. `_mv "group name"` retrieves random MV of specified group. Eg. _mv stu48'
                });
            break;


            



            // _roll
            case 'roll':
                var args = message.split(' ');
                var number = args[1];
                if(!isNaN(number) && number !== ""){
                	if(number > 0){
                    var rdm = Math.floor(Math.random() * number + 1);
	                    if(rdm === 1)
	                        bot.sendMessage({
	                            to: channelID,
	                            message: '*'+user+' rolled a '+rdm+' and got struck by lightning*'
	                        });
	                    else if(rdm == number)
	                        bot.sendMessage({
	                            to: channelID,
	                            message: '**'+user+' rolled a '+rdm+' and is made the king of the world!**'
	                        });
	                    else
	                        bot.sendMessage({
	                            to: channelID,
	                            message: user+' rolled a '+rdm+'.'
	                        });
	                	}
	            	else{
	            		bot.sendMessage({
	                        to: channelID,
	                        message: 'POOP!'
	                    });
	            	} 
            	}
                else{
                    bot.sendMessage({
                        to: channelID,
                        message: 'Not a number!'
                    });
                }
            break;

            // _ask
            case 'ask':
                var qns = message.substring(5);
                var yesno = ["Yes", "No"];
                if(qns !== ''){
                	qns = qns.trim();
                    var rdm = Math.floor(Math.random() * 2);
                    bot.sendMessage({
                        to: channelID,
                        message: "`"+user+' asked: '+qns+"` "+yesno[rdm]
                    });
                }
                else{
                    bot.sendMessage({
                        to: channelID,
                        message: 'please type the question after _ask!\r'
                        //+'Or you might have entered extra space after _ask'
                    });
                }
            break;

            // _choose
            case 'choose':
                var thingsStr = message.substring(7);
                if(thingsStr !== ''){
                    var thingsArr = thingsStr.split(",");
                    var rdm = Math.floor(Math.random() * thingsArr.length);
                    if(thingsArr[rdm]!=''){
                    	//console.log(rdm);
	                    bot.sendMessage({
	                        to: channelID,
	                        message: 'I choose `'+ thingsArr[rdm]+'`'
	                    });
                	}
                	else{
	                    bot.sendMessage({
	                        to: channelID,
	                        message: 'POOP!'
	                    });
                	}
                }
                else{
                    bot.sendMessage({
                        to: channelID,
                        message: 'Please enter values!'
                    });
                }
            break;

            //_meme
            case 'subreddit':
                var search = message.substring(10).split(' ');
                var nf = 'SubReddit not found!'
                console.log(search)
                randomPuppy(search[1])
                .then(url => {
                    bot.sendMessage({
                        to: channelID,
                        message: url
                    });
                });
                
            break;

            //_mv, _mv 'group', _mv list
            case 'mv':
                var rdmMV;
                var randomMV = allMVs;
                var lank = 'Sorry! no link for this MV is available currently!';
                var msg = message.substring(4);

                //get random MV
                if(msg === ''){
                    rdmMV = randomMV[Math.floor(Math.random()*randomMV.length)];
                    //console.log(rdmMV);
                    if(rdmMV.link !== '')
                        var lank = rdmMV.link;

                    bot.sendMessage({
                        to:channelID,
                        message: '`'+rdmMV.groups+' '+rdmMV.name+':`\r'+ lank
                    });
                }

                //view list of grps avail in database
                else if(msg === 'list'){
                    var grps = [];
                    var list = 'Groups available: `';

                    //push and filter to get unique group in array
                    for(var i = 0;i < randomMV.length;i++)
                        grps.push(randomMV[i].groups);
                    grps = grps.filter(function(item, pos){
                        return grps.indexOf(item) == pos;
                    });

                    //create message to be sent in chat
                    for(var j = 0;j < grps.length;j++)
                        list += j == grps.length - 1 ? grps[j] +'`':grps[j] + ', ';
                    //console.log(list);
                    bot.sendMessage({
                        to: channelID,
                        message: list
                    });
                }

                //get random MV from specified group
                else{

                    //filter to specified group
                    randomMV = randomMV.filter(function(obj){
                        if(obj.groups.toUpperCase() === msg.toUpperCase())
                            return obj
                    });

                    //set rdmMV with random MV rolled
                    if(randomMV.length > 0){
                    	rdmMV = randomMV[Math.floor(Math.random()*randomMV.length)];
                        if(rdmMV.link !== '')
                            var lank = rdmMV.link;
                        bot.sendMessage({
                            to: channelID,
                            message: '`'+rdmMV.groups+' '+rdmMV.name+':`\r' + lank
                        });

                    }
                    else{
                        bot.sendMessage({
                            to: channelID,
                            message: 'Sorry! could not find group: ' + msg
                            +'\rType "_mv list" to view groups available currently available in the database!'
                        });
                        return;
                    }
                }
            break;

            case 'roulette':
            	var i = 0;
            	var msg = message.substring(10);
            	var people = msg.split(' ');
            	var bullets = ['', '', 'bullet', '', '', ''];
            	var sI = setInterval(function(){
	            	if(i >= people.length) i = 0;
            		var rdm = Math.floor(Math.random() * bullets.length);
            		if(bullets[rdm] === 'bullet'){
	            		bot.sendMessage({
	            			to:channelID,
	            			message: people[i] + ' died'
	            		});
	            		clearInterval(sI);
	            	}
	            	else{
	            		bot.sendMessage({
	            			to:channelID,
	            			message: people[i] + ' survived'
	            		});
	            		bullets.splice(rdm, 1);
	            	}
	            	i++
            	}, 1000)
            	break;



            case 'test':
            	//var link = 'https://discordapp.com/channels/' + bot.channels[channelID].guild_id;
            	//var avatars = bot.channels[channelID].guild_id.getElementsByClass('image-33JSyf small-5Os1Bb mask-3OgeRz').value;
            	//console.log(avatars)
            	//console.log(bot.channels[channelID].guild_id) >2001
                var filter = allMem.filter(function(obj){
                    if(obj.birthplace.split(',')[0].toUpperCase() === 'SAITAMA')
                        return obj;
                });
                var randomMem = filter[/*Math.floor(Math.random()*filter.length)*/1];
                
                var temp = randomMem
                //console.log(randomMem.pictures.pop());
                bot.sendMessage({
                    to:channelID,
                    message: randomMem.pictures.pop() + '\r' +randomMem.birthplace + ' ' +filter.length
                });
                /*var filter = allMem.filter(function(obj){
                    if(obj.name.split(' (')[0] === 'Hiwatashi Yui')
                        return obj;
                });
                var randomMem = filter[Math.floor(Math.random()*filter.length)];
                //if(randomMem.pictures.pop() == randomMem.pictures[0] || randomMem.pictures.pop() == randomMem.pictures[6])
                bot.sendMessage({
                    to:channelID,
                    message: randomMem.pictures.pop() + '\r' + randomMem.name
                });*/

            break;

            // Just add any case commands if you want to..
            
            

            // Anything else that isn't a command
            default:
                bot.sendMessage({
                    to: channelID,
                    message: 'type _help to see list of commands!'
                });
            break;
         }
     }
});