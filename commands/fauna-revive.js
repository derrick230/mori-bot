const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');



//stuff to be exported and gets executed whenever interaction is called
module.exports = {
    data: new SlashCommandBuilder()
        .setName('fauna-revive')
        .setDescription('Roll a 70 or higher to revive another person.')
        .addMentionableOption(option =>
            option.setName('mention')
                .setDescription('Select your target!')
                .setRequired(true)),
    async execute(interaction) {
        let createdEmbed;
        let diceRoll = Math.floor(Math.random() * 100) + 1;
        let rawdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fauna-revive-stats.json'))); //for trackFauna()
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
        function trackFauna(critCheck, rawdata) {
            // 1 = crit fail 2 = fail 3 = success 4 = crit success
            switch (critCheck) {
                case 1:
                    rawdata.faunaattempts += 1;
                    rawdata.faunalevel -= 1;
                    break;
                case 2:
                    rawdata.faunaattempts += 1;
                    rawdata.faunalevel += 1;
                    break;
                case 3:
                    rawdata.faunakills += 1;
                    rawdata.faunaattempts += 1;
                    rawdata.faunalevel += 2;
                    break;
                case 4:
                    rawdata.faunakills += 2;
                    rawdata.faunaattempts += 1;
                    rawdata.faunalevel += 5;
                    break;
                default:
                    throw error;

            }

            console.log(rawdata);
            fs.writeFileSync(path.resolve(__dirname, 'fauna-revive-stats.json'), JSON.stringify(rawdata));
            return rawdata;
        }

        //moves the according player up or down the layers and writes it
        function trackRevive(critCheck, playerID, targetID, playerdata) {
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
                    playerdata.user[playerID].attemptedRevives += 1;
                    playerdata.user[playerID].successfulKills += 1;
                    playerdata.user[playerID].receivedKills += 1;
                    playerdata.user[playerID].currentLayer += 1;
                    break;
                case 2:
                    playerdata.user[playerID].attemptedRevives += 1;
                    break;
                case 3:
                    playerdata.user[playerID].attemptedRevives += 1;
                    playerdata.user[playerID].successfulRevives += 1;
                    playerdata.user[targetID].receivedRevives += 1;
                    playerdata.user[targetID].currentLayer -= 1;
                    break;
                case 4:
                    playerdata.user[playerID].attemptedRevives += 1;
                    playerdata.user[playerID].successfulRevives += 2;
                    playerdata.user[targetID].receivedRevives += 2;
                    playerdata.user[targetID].currentLayer -= 2;
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
            rawdata = trackFauna(4, rawdata);
            playerdata = trackRevive(4, interaction.user.id, mentionID, playerdata)
            createdEmbed = new MessageEmbed()
                .setColor('#89f58d')
                .setAuthor('YOU ROLLED A ' + diceRoll + '!')
                .setTitle('CRITICAL SUCCESS!')
                .setDescription('They are currently on Layer '+ playerdata.user[mentionID].currentLayer)
                .setThumbnail('https://yt3.ggpht.com/1rUoSkwh5LJbR8ez3-l02cdoOIKt9IlhKJxkBTqoff2qZb-VV3wUTFpkE2cNDQnOjk8wR-TW=s900-c-k-c0x00ffffff-no-rj')
                .addFields(
                    { name: 'Revive Count', value: rawdata.faunakills.toString(), inline: true },
                    { name: 'Fauna Attempts', value: rawdata.faunaattempts.toString(), inline: true },
                    { name: 'Power Level', value: rawdata.faunalevel.toString(), inline: true },
                )
                .setTimestamp()
                .setFooter('Come to mommy', 'https://static.wikia.nocookie.net/youtube/images/f/f0/Ceres_Fauna_Ch._hololive-EN2a.png/revision/latest/scale-to-width-down/250?cb=20210817121909');
        }
        //critical failure
        else if (diceRoll == 1) {
            rawdata = trackFauna(1, rawdata);
            playerdata = trackRevive(1, interaction.user.id, mentionID, playerdata)
            createdEmbed = new MessageEmbed()
                .setColor('#89f58d')
                .setAuthor('You rolled a ' + diceRoll + '!')
                .setTitle('CRITICAL FAILURE! YOU KILLED THEM LMAO')
                .setDescription('You are now on Layer '+ playerdata.user[interaction.user.id].currentLayer)
                .setThumbnail('https://yt3.ggpht.com/1rUoSkwh5LJbR8ez3-l02cdoOIKt9IlhKJxkBTqoff2qZb-VV3wUTFpkE2cNDQnOjk8wR-TW=s900-c-k-c0x00ffffff-no-rj')
                .addFields(
                    { name: 'Revive Count', value: rawdata.faunakills.toString(), inline: true },
                    { name: 'Fauna Attempts', value: rawdata.faunaattempts.toString(), inline: true },
                    { name: 'Power Level', value: rawdata.faunalevel.toString(), inline: true },
                )
                .setTimestamp()
                .setFooter('Come to mommy', 'https://static.wikia.nocookie.net/youtube/images/f/f0/Ceres_Fauna_Ch._hololive-EN2a.png/revision/latest/scale-to-width-down/250?cb=20210817121909');
        }
        //successful kill
        else if (diceRoll >= 70) {
            rawdata = trackFauna(3, rawdata);
            playerdata = trackRevive(3, interaction.user.id, mentionID, playerdata)
            createdEmbed = new MessageEmbed()
                .setColor('#89f58d')
                .setAuthor('You rolled a ' + diceRoll + '!')
                .setTitle('They were successfully revived!')
                .setDescription('They are currently on Layer '+ playerdata.user[mentionID].currentLayer)
                .setThumbnail('https://yt3.ggpht.com/1rUoSkwh5LJbR8ez3-l02cdoOIKt9IlhKJxkBTqoff2qZb-VV3wUTFpkE2cNDQnOjk8wR-TW=s900-c-k-c0x00ffffff-no-rj')
                .addFields(
                    { name: 'Revive Count', value: rawdata.faunakills.toString(), inline: true },
                    { name: 'Fauna Attempts', value: rawdata.faunaattempts.toString(), inline: true },
                    { name: 'Power Level', value: rawdata.faunalevel.toString(), inline: true },
                )
                .setTimestamp()
                .setFooter('Come to mommy', 'https://static.wikia.nocookie.net/youtube/images/f/f0/Ceres_Fauna_Ch._hololive-EN2a.png/revision/latest/scale-to-width-down/250?cb=20210817121909');
        }
        // else/failure
        else {
            rawdata = trackFauna(2, rawdata);
            playerdata = trackRevive(2, interaction.user.id, mentionID, playerdata)
            createdEmbed = new MessageEmbed()
                .setColor('#89f58d')
                .setAuthor('You rolled a ' + diceRoll + '!')
                .setTitle('You were unsuccessful!')
                .setDescription('They are currently on Layer '+ playerdata.user[mentionID].currentLayer)
                .setThumbnail('https://c.tenor.com/lB7CMNcvH-kAAAAC/ceres-fauna-hololive.gif')
                .addFields(
                    { name: 'Revive Count', value: rawdata.faunakills.toString(), inline: true },
                    { name: 'Fauna Attempts', value: rawdata.faunaattempts.toString(), inline: true },
                    { name: 'Power Level', value: rawdata.faunalevel.toString(), inline: true },
                )
                .setTimestamp()
                .setFooter('Come to mommy', 'https://static.wikia.nocookie.net/youtube/images/f/f0/Ceres_Fauna_Ch._hololive-EN2a.png/revision/latest/scale-to-width-down/250?cb=20210817121909');
        }

        interaction.reply({ embeds: [createdEmbed] });
    },
};