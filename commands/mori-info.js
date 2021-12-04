const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');



//stuff to be exported and gets executed whenever interaction is called
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mori-info')
        .setDescription('Check stats on yourself or @user.')
        .addMentionableOption(option =>
            option.setName('mention')
                .setDescription('Select your target!')
                .setRequired(false)),
    async execute(interaction) {
        let createdEmbed;
        let targetID;
        let playerdata = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'player-info.json'))); //uses player-info.json to check stats
        let mentionable = interaction.options.getMentionable('mention');
        if(mentionable != null){
            targetID = getUserFromMention(mentionable.toString());
        } else {
            targetID = interaction.user.id;
        }
        playerdata = checkUser(targetID, playerdata)



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

        //checks if user has any stats, if not, gives them a blank slate
        function checkUser(targetID, playerdata) {
            const defaultStats = {
                "currentLayer": 0,
                "attemptedKills": 0,
                "successfulKills": 0,
                "critKills": 0,
                "receivedKills": 0,
                "attemptedRevives": 0,
                "successfulRevives": 0,
                "critRevives": 0,
                "receivedRevives": 0
            }
            //checks if the user is in player-info.json yet, if not, they are added
            if (playerdata.user[targetID] == null) {
                playerdata.user[targetID] = defaultStats;
            }

            console.log(playerdata);
            fs.writeFileSync(path.resolve(__dirname, 'player-info.json'), JSON.stringify(playerdata));
            return playerdata;
        }




        //message embed

        createdEmbed = new MessageEmbed()
            .setColor('#ed7bc7')
            .setTitle('Player Stats')
            .setDescription('Currently on Layer ' + playerdata.user[targetID].currentLayer)
            .setThumbnail('https://cdn.discordapp.com/attachments/368462069630107661/916194503499599902/sample-9da68d603ce0c905976283bcb1ef215a.jpg')
            .addFields(
                { name: 'Attempted Kills', value: playerdata.user[targetID].attemptedKills.toString(), inline: true },
                { name: 'Successful Kills', value: playerdata.user[targetID].successfulKills.toString(), inline: true },
                { name: 'Death Count', value: playerdata.user[targetID].receivedKills.toString(), inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Attempted Revives', value: playerdata.user[targetID].attemptedRevives.toString(), inline: true },
                { name: 'Successful Revives', value: playerdata.user[targetID].successfulKills.toString(), inline: true },
                { name: 'Revives Received', value: playerdata.user[targetID].receivedRevives.toString(), inline: true },
            )
            .setTimestamp()
            .setFooter('Reaped by yours truly','https://i.ytimg.com/vi/1wg6GJVDS74/maxresdefault.jpg');


        interaction.reply({ embeds: [createdEmbed] });
    },
};