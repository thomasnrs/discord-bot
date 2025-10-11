const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca uma música')
        .addStringOption(option =>
            option.setName('musica')
                .setDescription('Nome da música ou URL do YouTube')
                .setRequired(true)),

    async execute(interaction) {
        const query = interaction.options.getString('musica');
        const musicSystem = interaction.client.musicSystem;
        
        await interaction.deferReply();

        const result = await musicSystem.play(interaction, query);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff88' : '#ff4444')
            .setTitle('🎵 Música')
            .setDescription(result.message)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
