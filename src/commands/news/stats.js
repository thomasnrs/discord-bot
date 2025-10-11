const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newsstats')
        .setDescription('Mostra estatísticas do sistema de notícias')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const newsSystem = interaction.client.newsSystem;
        const stats = newsSystem.getStats();
        
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('📊 Estatísticas do Sistema de Notícias')
            .setDescription('Informações sobre o sistema automático de notícias')
            .addFields(
                { name: '📰 Fontes Configuradas', value: `\`${stats.sources}\``, inline: true },
                { name: '🔍 Palavras-chave', value: `\`${stats.keywords}\``, inline: true },
                { name: '📈 Notícias Processadas', value: `\`${stats.lastNewsCount}\``, inline: true },
                { name: '⏰ Intervalo de Atualização', value: `\`A cada 15 minutos\``, inline: true },
                { name: '📺 Canal de Notícias', value: `<#${stats.channelId}>`, inline: true },
                { name: '🔄 Status', value: `\`Ativo\``, inline: true }
            )
            .addFields(
                { name: '📰 Fontes de Notícias', value: '• BleepingComputer\n• The Hacker News\n• Krebs on Security\n• Dark Reading\n• SecurityWeek', inline: false },
                { name: '🔍 Palavras-chave Monitoradas', value: 'data breach, vazamento, cybersecurity, hack, vulnerability, malware, ransomware, discord, security', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Skynet Cibersegurança • Sistema de Notícias' });

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
