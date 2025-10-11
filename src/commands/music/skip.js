const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Pula a música atual'),

    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem;
        const result = await musicSystem.skip(interaction);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('⏭️ Pular')
            .setDescription(result.message)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
