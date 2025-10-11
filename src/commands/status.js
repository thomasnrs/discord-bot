const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Mostra o status atual do bot'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Calcular ping
            const sent = await interaction.followUp({ content: 'Calculando...', ephemeral: true });
            const ping = sent.createdTimestamp - interaction.createdTimestamp;

            // Criar embed de status
            const statusEmbed = interaction.client.systemStats.createStatusEmbed(ping);

            await interaction.editReply({
                content: '',
                embeds: [statusEmbed]
            });

            // Incrementar contador de comandos
            interaction.client.systemStats.incrementCommandCount();

            console.log(`🤖 Comando status executado por ${interaction.user.tag}`);

        } catch (error) {
            console.error('❌ Erro no comando status:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro ao obter status')
                .setDescription('Ocorreu um erro ao verificar o status do bot.')
                .setTimestamp();

            await interaction.editReply({
                content: '',
                embeds: [errorEmbed]
            });
        }
    },
};
