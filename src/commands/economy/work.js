const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Trabalhe para ganhar moedas'),

    async execute(interaction) {
        const economy = interaction.client.economy;
        const result = economy.work(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('💼 Trabalho')
            .setDescription(result.message)
            .setTimestamp();

        if (result.success) {
            embed.addFields(
                { name: '💵 Ganho', value: `\`${result.amount} moedas\``, inline: true },
                { name: '⏰ Próximo', value: 'Em 30 minutos', inline: true }
            );
        }

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
