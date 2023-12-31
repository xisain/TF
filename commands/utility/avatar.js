const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar URL of the selected user, or your own avatar.')
        .addUserOption(option => option.setName('username').setDescription("The user's avatar to show")),

    async execute(interaction) {
        const user = interaction.options.getUser('username') || interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s avatar`)
            .setImage(user.displayAvatarURL())
            .setColor('#00FF00') // You can customize the color
			.setTimestamp()
			.setFooter({ text: `requested by ${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL()}` });

        return interaction.reply({ embeds: [embed] });
    },
};
