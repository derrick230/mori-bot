module.exports = {
	name: 'interactionCreate',
	execute(interactionCreate) {
		console.log(`${interactionCreate.user.tag} in #${interactionCreate.channel.name} triggered an interaction.`);
	},
};