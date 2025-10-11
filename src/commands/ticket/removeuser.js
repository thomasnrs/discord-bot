const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeuser')
        .setDescription('Remove um usuário do ticket')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para remover')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const ticketSystem = interaction.client.ticketSystem;
        const result = await ticketSystem.removeUser(interaction, user);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('👥 Remover Usuário')
            .setDescription(result.message)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
