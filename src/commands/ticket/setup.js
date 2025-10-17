const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketsetup')
        .setDescription('Configura o sistema de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const ticketSystem = interaction.client.ticketSystem;
        
        await interaction.deferReply({ flags: 64 }); // MessageFlags.Ephemeral

        try {
            // Garantir que o client está definido
            if (!ticketSystem.client) {
                ticketSystem.client = interaction.client;
            }
            
            // Recriar painel de tickets
            await ticketSystem.createTicketPanel();
            
            // Se não foi criado automaticamente, criar no canal atual
            if (!ticketSystem.ticketPanelChannelId) {
                await ticketSystem.sendTicketPanel(interaction.channel);
                ticketSystem.ticketPanelChannelId = interaction.channel.id;
            }

            const stats = ticketSystem.getStats();
            
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('✅ Sistema de Tickets Configurado')
                .setDescription('O sistema de tickets foi configurado com sucesso!')
                .addFields(
                    { name: '📁 Categoria', value: `<#${ticketSystem.ticketCategoryId}>`, inline: true },
                    { name: '📋 Painel', value: ticketSystem.ticketPanelChannelId ? `<#${ticketSystem.ticketPanelChannelId}>` : 'Não criado', inline: true },
                    { name: '👥 Admin Role', value: `<@&${ticketSystem.adminRoleId}>`, inline: true },
                    { name: '📊 Estatísticas', value: `**Total:** ${stats.totalTickets}\n**Abertos:** ${stats.openTickets}\n**Pausados:** ${stats.pausedTickets}`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Nebula Friends • Sistema de Tickets' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro no comando ticketsetup:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro na Configuração')
                .setDescription('Ocorreu um erro ao configurar o sistema de tickets.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
