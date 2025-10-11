const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketlogs')
        .setDescription('Mostra os logs do ticket atual')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const ticketSystem = interaction.client.ticketSystem;
        
        try {
            const result = await ticketSystem.showTicketLogs(interaction);
            
            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setColor('#ff4444')
                    .setTitle('❌ Erro')
                    .setDescription(result.message)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

        } catch (error) {
            console.error('❌ Erro no comando ticketlogs:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro')
                .setDescription('Ocorreu um erro ao mostrar os logs!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
