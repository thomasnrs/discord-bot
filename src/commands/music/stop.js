const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a música e limpa a fila'),

    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem;
        const result = await musicSystem.stop(interaction);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('⏹️ Parar')
            .setDescription(result.message)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
