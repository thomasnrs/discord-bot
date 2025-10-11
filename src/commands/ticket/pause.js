const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketpause')
        .setDescription('Pausa o ticket atual')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const ticketSystem = interaction.client.ticketSystem;
        
        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await ticketSystem.pauseTicket(interaction);
            
            const embed = new EmbedBuilder()
                .setColor(result.success ? '#00ff88' : '#ff4444')
                .setTitle(result.success ? '✅ Ticket Pausado' : '❌ Erro')
                .setDescription(result.message)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro no comando ticketpause:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro')
                .setDescription('Ocorreu um erro ao pausar o ticket!')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
