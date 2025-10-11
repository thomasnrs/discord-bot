const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Receba moedas diárias'),

    async execute(interaction) {
        const economy = interaction.client.economy;
        const result = economy.daily(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('💰 Daily')
            .setDescription(result.message)
            .setTimestamp();

        if (result.success) {
            embed.addFields(
                { name: '💵 Ganho', value: `\`${result.amount} moedas\``, inline: true },
                { name: '⏰ Próximo', value: 'Em 24 horas', inline: true }
            );
        }

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
