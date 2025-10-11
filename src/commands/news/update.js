const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newsupdate')
        .setDescription('Força atualização manual das notícias')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const newsSystem = interaction.client.newsSystem;
        
        await interaction.deferReply();

        try {
            const embed = new EmbedBuilder()
                .setColor('#ff8800')
                .setTitle('🔄 Atualizando Notícias...')
                .setDescription('Buscando notícias mais recentes sobre cibersegurança...')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Forçar atualização
            await newsSystem.fetchAndPostNews();

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('✅ Notícias Atualizadas')
                .setDescription('Sistema de notícias atualizado com sucesso!')
                .addFields(
                    { name: '📰 Ação', value: 'Busca manual executada', inline: true },
                    { name: '⏰ Próxima Atualização', value: 'Automática em 15 minutos', inline: true },
                    { name: '📺 Canal', value: `<#${newsSystem.newsChannelId}>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Skynet Cibersegurança • Atualização Manual' });

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('❌ Erro no comando newsupdate:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro na Atualização')
                .setDescription('Ocorreu um erro ao atualizar as notícias. Verifique os logs para mais detalhes.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
