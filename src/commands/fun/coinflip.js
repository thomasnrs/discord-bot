const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Jogue cara ou coroa')
        .addStringOption(option =>
            option.setName('escolha')
                .setDescription('Sua escolha')
                .setRequired(false)
                .addChoices(
                    { name: 'Cara', value: 'cara' },
                    { name: 'Coroa', value: 'coroa' }
                )),

    async execute(interaction) {
        const choice = interaction.options.getString('escolha');
        const result = Math.random() < 0.5 ? 'cara' : 'coroa';
        
        const resultEmoji = result === 'cara' ? '🟡' : '⚫';
        const resultText = result === 'cara' ? 'Cara' : 'Coroa';
        
        let description = `${resultEmoji} **${resultText}**!`;
        let color = '#00ff88';
        
        if (choice) {
            const won = choice === result;
            description += `\n\n${won ? '🎉 **Você ganhou!**' : '😢 **Você perdeu!**'}`;
            color = won ? '#00ff88' : '#ff4444';
        }
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🪙 Cara ou Coroa')
            .setDescription(description)
            .addFields(
                { name: '🎯 Resultado', value: resultText, inline: true },
                { name: '🎲 Sorte', value: choice ? (choice === result ? 'Boa!' : 'Azar!') : 'N/A', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Jogado por ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
