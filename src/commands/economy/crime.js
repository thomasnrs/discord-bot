const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Cometa um crime para ganhar ou perder moedas'),

    async execute(interaction) {
        const economy = interaction.client.economy;
        const result = economy.crime(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#ff8800' : '#ff4444')
            .setTitle('🎭 Crime')
            .setDescription(result.message)
            .setTimestamp();

        if (result.success) {
            embed.addFields(
                { name: '💰 Resultado', value: `\`${result.amount} moedas\``, inline: true },
                { name: '⏰ Próximo', value: 'Em 1 hora', inline: true }
            );
        }

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
