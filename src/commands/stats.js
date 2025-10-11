const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Mostra as estatísticas do bot e do sistema'),

    async execute(interaction) {
        // Verificar se o usuário tem permissão (opcional - você pode remover se quiser que todos vejam)
        if (!interaction.member.permissions.has('ManageGuild')) {
            return await interaction.reply({
                content: '❌ Você não tem permissão para usar este comando.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            // Calcular ping
            const sent = await interaction.followUp({ content: 'Calculando ping...', ephemeral: true });
            const ping = sent.createdTimestamp - interaction.createdTimestamp;

            // Criar embed com as estatísticas
            const statsEmbed = interaction.client.systemStats.createStatsEmbed(ping);

            await interaction.editReply({
                content: '',
                embeds: [statsEmbed]
            });

            // Incrementar contador de comandos
            interaction.client.systemStats.incrementCommandCount();

            console.log(`📊 Comando stats executado por ${interaction.user.tag}`);

        } catch (error) {
            console.error('❌ Erro no comando stats:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro ao obter estatísticas')
                .setDescription('Ocorreu um erro ao coletar as informações do sistema.')
                .setTimestamp();

            await interaction.editReply({
                content: '',
                embeds: [errorEmbed]
            });
        }
    },
};
