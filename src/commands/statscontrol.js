const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statscontrol')
        .setDescription('Controla o sistema de stats automático')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Inicia o envio automático de stats'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Para o envio automático de stats'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Mostra o status do sistema de stats automático')),

    async execute(interaction) {
        // Verificar se o usuário tem permissão de administrador
        if (!interaction.member.permissions.has('Administrator')) {
            return await interaction.reply({
                content: '❌ Você precisa ter permissão de **Administrador** para usar este comando.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'start':
                    if (interaction.client.statsInterval) {
                        return await interaction.reply({
                            content: '⚠️ O sistema de stats automático já está rodando!',
                            ephemeral: true
                        });
                    }

                    // Reiniciar o sistema de stats
                    const { startAutoStats } = require('../bot.js');
                    startAutoStats();

                    const startEmbed = new EmbedBuilder()
                        .setColor('#00ff88')
                        .setTitle('✅ Sistema de Stats Iniciado')
                        .setDescription('O envio automático de stats foi iniciado!')
                        .addFields(
                            { name: '📺 Canal', value: '<#1426577469284024420>', inline: true },
                            { name: '⏰ Intervalo', value: '30 segundos', inline: true },
                            { name: '🔄 Status', value: 'Ativo', inline: true }
                        )
                        .setTimestamp();

                    await interaction.reply({ embeds: [startEmbed] });
                    break;

                case 'stop':
                    if (!interaction.client.statsInterval) {
                        return await interaction.reply({
                            content: '⚠️ O sistema de stats automático não está rodando!',
                            ephemeral: true
                        });
                    }

                    clearInterval(interaction.client.statsInterval);
                    interaction.client.statsInterval = null;

                    const stopEmbed = new EmbedBuilder()
                        .setColor('#ff4444')
                        .setTitle('⏹️ Sistema de Stats Parado')
                        .setDescription('O envio automático de stats foi interrompido!')
                        .setTimestamp();

                    await interaction.reply({ embeds: [stopEmbed] });
                    break;

                case 'status':
                    const isRunning = !!interaction.client.statsInterval;
                    const statusEmbed = new EmbedBuilder()
                        .setColor(isRunning ? '#00ff88' : '#ff4444')
                        .setTitle('📊 Status do Sistema de Stats')
                        .setDescription(isRunning ? 'Sistema ativo e funcionando!' : 'Sistema parado')
                        .addFields(
                            { name: '🔄 Status', value: isRunning ? '🟢 Ativo' : '🔴 Parado', inline: true },
                            { name: '📺 Canal', value: '<#1426577469284024420>', inline: true },
                            { name: '⏰ Intervalo', value: '30 segundos', inline: true },
                            { name: '📈 Última Mensagem', value: interaction.client.lastStatsMessage ? 'Enviada' : 'Nenhuma', inline: true }
                        )
                        .setTimestamp();

                    await interaction.reply({ embeds: [statusEmbed] });
                    break;
            }

            // Incrementar contador de comandos
            interaction.client.systemStats.incrementCommandCount();

        } catch (error) {
            console.error('❌ Erro no comando statscontrol:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro')
                .setDescription('Ocorreu um erro ao executar este comando.')
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
