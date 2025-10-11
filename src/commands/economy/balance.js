const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Mostra seu saldo atual')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ver o saldo (opcional)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const economy = interaction.client.economy;
        
        const userData = economy.getUserData(targetUser.id);
        const embed = economy.createProfileEmbed(targetUser, userData);
        
        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
