const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketpanel')
        .setDescription('Cria ou recria o painel de tickets no canal atual')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const ticketSystem = interaction.client.ticketSystem;
        
        await interaction.deferReply({ ephemeral: true });

        try {
            // Enviar painel no canal atual
            await ticketSystem.sendTicketPanel(interaction.channel);
            
            // Atualizar ID do canal de painel
            ticketSystem.ticketPanelChannelId = interaction.channel.id;

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('✅ Painel de Tickets Criado!')
                .setDescription('O painel de tickets foi criado com sucesso neste canal!')
                .addFields(
                    { name: '📺 Canal', value: interaction.channel.toString(), inline: true },
                    { name: '📁 Categoria', value: `<#${ticketSystem.ticketCategoryId}>`, inline: true },
                    { name: '👥 Admin Role', value: `<@&${ticketSystem.adminRoleId}>`, inline: true },
                    { name: '📋 Funcionalidades', value: '• Botão para abrir tickets\n• Menu de categorias\n• Sistema de logs centralizado', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Nebula Friends • Sistema de Tickets' });

            await interaction.editReply({ embeds: [embed] });

            // Log da criação do painel
            ticketSystem.sendLogToChannel('panel_created', interaction.user.id, 'Painel de tickets criado manualmente');

        } catch (error) {
            console.error('❌ Erro no comando ticketpanel:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro ao Criar Painel')
                .setDescription('Ocorreu um erro ao criar o painel de tickets.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
