const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Mostra a música que está tocando'),

    async execute(interaction) {
        const musicSystem = interaction.client.musicSystem;
        const result = await musicSystem.nowplaying(interaction);
        
        if (!result.success) {
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('🎵 Tocando Agora')
                .setDescription(result.message)
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] });
        }

        await interaction.reply({ embeds: [result.embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
