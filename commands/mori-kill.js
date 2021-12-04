const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');



//stuff to be exported and gets executed whenever interaction is called
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mori-kill')
        .setDescription('Roll a 70 or higher to kill another person.')
        .addMentionableOption(option =>
            option.setName('mention')
                .setDescription('Select your target!')
                .setRequired(true)),
    async execute(interaction) {
        let createdEmbed;
        let diceRoll = Math.floor(Math.random() * 100) + 1;
        let rawdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'mori-kill-stats.json'))); //for trackMori()
        let playerdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'player-info.json'))); //for moveLayers()
        let mentionable = interaction.options.getMentionable('mention');
        let mentionID = getUserFromMention(mentionable.toString());


        //functions

        //splices '<@' and '>' from mentions
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

        //updates json according to case statements, writes it to file, and returns the new JSON data
        function trackMori(critCheck, rawdata) {
            // 1 = crit fail 2 = fail 3 = success 4 = crit success
            switch (critCheck) {
                case 1:
                    rawdata.moriattempts += 1;
                    rawdata.morilevel -= 1;
                    break;
                case 2:
                    rawdata.moriattempts += 1;
                    rawdata.morilevel += 1;
                    break;
                case 3:
                    rawdata.morikills += 1;
                    rawdata.moriattempts += 1;
                    rawdata.morilevel += 2;
                    break;
                case 4:
                    rawdata.morikills += 2;
                    rawdata.moriattempts += 1;
                    rawdata.morilevel += 5;
                    break;
                default:
                    throw error;

            }

            console.log(rawdata);
            fs.writeFileSync(path.resolve(__dirname, 'mori-kill-stats.json'), JSON.stringify(rawdata));
            return rawdata;
        }

        //moves the according player up or down the layers and writes it
        function trackKill(critCheck, playerID, targetID, playerdata) {
            const defaultStats = {
                "currentLayer": 0,
                "attemptedKills": 0,
                "successfulKills": 0,
                "receivedKills": 0,
                "attemptedRevives": 0,
                "successfulRevives": 0,
                "receivedRevives": 0
            }
            //checks if the users are in player-info.json yet, if not, they are added
            if (playerdata.user[playerID] == null) {
                playerdata.user[playerID] = defaultStats;
            }
            if (playerdata.user[targetID] == null) {
                playerdata.user[targetID] = defaultStats;
            }
            // 1 = crit fail 2 = fail 3 = success 4 = crit success
            switch (critCheck) {
                case 1:
                    playerdata.user[playerID].attemptedKills += 1;
                    playerdata.user[playerID].successfulKills += 1;
                    playerdata.user[playerID].receivedKills += 1;
                    playerdata.user[playerID].currentLayer += 1;
                    break;
                case 2:
                    playerdata.user[playerID].attemptedKills += 1;
                    break;
                case 3:
                    playerdata.user[playerID].attemptedKills += 1;
                    playerdata.user[playerID].successfulKills += 1;
                    playerdata.user[targetID].receivedKills += 1;
                    playerdata.user[targetID].currentLayer += 1;
                    break;
                case 4:
                    playerdata.user[playerID].attemptedKills += 1;
                    playerdata.user[playerID].successfulKills += 2;
                    playerdata.user[targetID].receivedKills += 2;
                    playerdata.user[targetID].currentLayer += 2;
                    break;
                default:
                    throw error;
            }

            console.log(playerdata);
            fs.writeFileSync(path.resolve(__dirname, 'player-info.json'), JSON.stringify(playerdata));
            return playerdata;
        }




        //message embeds

        //critical success
        if (diceRoll == 100) {
            rawdata = trackMori(4, rawdata);
            playerdata = trackKill(4, interaction.user.id, mentionID, playerdata)
            createdEmbed = new MessageEmbed()
                .setColor('#ed7bc7')
                .setAuthor('YOU ROLLED A ' + diceRoll + '!')
                .setTitle('CRITICAL SUCCESS!')
                .setDescription('They are currently on Layer '+ playerdata.user[mentionID].currentLayer)
                .setThumbnail('https://cdn.discordapp.com/attachments/368462069630107661/916194503499599902/sample-9da68d603ce0c905976283bcb1ef215a.jpg')
                .addFields(
                    { name: 'Kill Count', value: rawdata.morikills.toString(), inline: true },
                    { name: 'Mori Attempts', value: rawdata.moriattempts.toString(), inline: true },
                    { name: 'Power Level', value: rawdata.morilevel.toString(), inline: true },
                )
                .setTimestamp()
                .setFooter('Reaped by yours truly', 'https://i.ytimg.com/vi/1wg6GJVDS74/maxresdefault.jpg');
        }
        //critical failure
        else if (diceRoll == 1) {
            rawdata = trackMori(1, rawdata);
            playerdata = trackKill(1, interaction.user.id, mentionID, playerdata)
            createdEmbed = new MessageEmbed()
                .setColor('#ed7bc7')
                .setAuthor('You rolled a ' + diceRoll + '!')
                .setTitle('CRITICAL FAILURE! YOU KILLED YOURSELF LMAO')
                .setDescription('You are now on Layer '+ playerdata.user[interaction.user.id].currentLayer)
                .setThumbnail('https://cdn.discordapp.com/attachments/368462069630107661/916194503499599902/sample-9da68d603ce0c905976283bcb1ef215a.jpg')
                .addFields(
                    { name: 'Kill Count', value: rawdata.morikills.toString(), inline: true },
                    { name: 'Mori Attempts', value: rawdata.moriattempts.toString(), inline: true },
                    { name: 'Power Level', value: rawdata.morilevel.toString(), inline: true },
                )
                .setTimestamp()
                .setFooter('Reaped by yours truly', 'https://i.ytimg.com/vi/1wg6GJVDS74/maxresdefault.jpg');
        }
        //successful kill
        else if (diceRoll >= 70) {
            rawdata = trackMori(3, rawdata);
            playerdata = trackKill(3, interaction.user.id, mentionID, playerdata)
            createdEmbed = new MessageEmbed()
                .setColor('#ed7bc7')
                .setAuthor('You rolled a ' + diceRoll + '!')
                .setTitle('They were successfully killed!')
                .setDescription('They are currently on Layer '+ playerdata.user[mentionID].currentLayer)
                .setThumbnail('https://cdn.discordapp.com/attachments/368462069630107661/916194503499599902/sample-9da68d603ce0c905976283bcb1ef215a.jpg')
                .addFields(
                    { name: 'Kill Count', value: rawdata.morikills.toString(), inline: true },
                    { name: 'Mori Attempts', value: rawdata.moriattempts.toString(), inline: true },
                    { name: 'Power Level', value: rawdata.morilevel.toString(), inline: true },
                )
                .setTimestamp()
                .setFooter('Reaped by yours truly', 'https://i.ytimg.com/vi/1wg6GJVDS74/maxresdefault.jpg');
        }
        // else/failure
        else {
            rawdata = trackMori(2, rawdata);
            playerdata = trackKill(2, interaction.user.id, mentionID, playerdata)
            createdEmbed = new MessageEmbed()
                .setColor('#ed7bc7')
                .setAuthor('You rolled a ' + diceRoll + '!')
                .setTitle('You were unsuccessful!')
                .setDescription('They are currently on Layer '+ playerdata.user[mentionID].currentLayer)
                .setThumbnail('https://cdn.discordapp.com/attachments/368462069630107661/916194503499599902/sample-9da68d603ce0c905976283bcb1ef215a.jpg')
                .addFields(
                    { name: 'Kill Count', value: rawdata.morikills.toString(), inline: true },
                    { name: 'Mori Attempts', value: rawdata.moriattempts.toString(), inline: true },
                    { name: 'Power Level', value: rawdata.morilevel.toString(), inline: true },
                )
                .setTimestamp()
                .setFooter('Reaped by yours truly', 'https://i.ytimg.com/vi/1wg6GJVDS74/maxresdefault.jpg');
        }

        interaction.reply({ embeds: [createdEmbed] });
    },
};