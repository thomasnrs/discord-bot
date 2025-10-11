const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adduser')
        .setDescription('Adiciona um usuário ao ticket')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para adicionar')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const ticketSystem = interaction.client.ticketSystem;
        const result = await ticketSystem.addUser(interaction, user);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('👥 Adicionar Usuário')
            .setDescription(result.message)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
