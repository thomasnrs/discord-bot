const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Retoma a música pausada'),

    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem;
        const result = await musicSystem.resume(interaction);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('▶️ Retomar')
            .setDescription(result.message)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
