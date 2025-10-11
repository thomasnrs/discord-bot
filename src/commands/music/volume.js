const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Altera o volume da música')
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('Volume (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),

    async execute(interaction) {
        const volume = interaction.options.getInteger('volume');
        const musicSystem = interaction.client.musicSystem;
        const result = await musicSystem.volume(interaction, volume);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('🔊 Volume')
            .setDescription(result.message)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
