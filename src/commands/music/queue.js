const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra a fila de músicas'),

    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem;
        const result = await musicSystem.queue(interaction);
        
        if (!result.success) {
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('📋 Fila')
                .setDescription(result.message)
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] });
        }

        await interaction.reply({ embeds: [result.embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
