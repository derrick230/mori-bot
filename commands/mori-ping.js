const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mori-ping')
		.setDescription('Get ponged!'),
	async execute(interaction) {
		await interaction.reply('pong');
	},
}

