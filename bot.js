var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const fs = require("fs")
const path = require('path');


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
    // It will listen for messages that will start with `!`

    //Also saves the first word after in case there is a mention.
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var mnt = args[1];

        args = args.slice(1);
        switch (cmd) {
            // !ping


            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: "pong"
                });

                break;
            
            case 'roll':
                bot.sendMessage({
                    to: channelID,
                    message: "You rolled a " + roll100()
                });

                break;

            case 'kill':
                var targetUserID = getUserFromMention(mnt);
                var roll = roll100();
                if(roll == 100){
                    bot.sendMessage({
                        to: channelID,
                        message: "CRIT SUCCESS! You rolled a "+roll+"! Victim has fallen 2 layers."
                    });

                }else if(roll >= 70){
                    moveLayers();
                    bot.sendMessage({
                        to: channelID,
                        message: "Kill successful! You rolled a "+roll+"! Victim has fallen 1 layer."
                    });

                } else{
                    bot.sendMessage({
                        to: channelID,
                        message: "Kill failed! You rolled a "+roll+"!"
                    });
                }

                break;


        }
    }
});

function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return mention;
	}
}

function roll100() {
    return Math.floor(Math.random() * 100)+1;
}

function moveLayers(userID, number) {
    return Math.floor(Math.random() * 100)+1;
}