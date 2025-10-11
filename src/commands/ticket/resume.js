const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketresume')
        .setDescription('Retoma o ticket atual')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const ticketSystem = interaction.client.ticketSystem;
        
        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await ticketSystem.resumeTicket(interaction);
            
            const embed = new EmbedBuilder()
                .setColor(result.success ? '#00ff88' : '#ff4444')
                .setTitle(result.success ? '✅ Ticket Retomado' : '❌ Erro')
                .setDescription(result.message)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro no comando ticketresume:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro')
                .setDescription('Ocorreu um erro ao retomar o ticket!')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
