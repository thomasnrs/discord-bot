const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Role dados')
        .addIntegerOption(option =>
            option.setName('lados')
                .setDescription('Número de lados do dado')
                .setRequired(false)
                .setMinValue(2)
                .setMaxValue(100))
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Quantidade de dados')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)),

    async execute(interaction) {
        const sides = interaction.options.getInteger('lados') || 6;
        const quantity = interaction.options.getInteger('quantidade') || 1;
        
        const results = [];
        let total = 0;
        
        for (let i = 0; i < quantity; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            results.push(roll);
            total += roll;
        }
        
        const diceEmojis = {
            1: '⚀',
            2: '⚁',
            3: '⚂',
            4: '⚃',
            5: '⚄',
            6: '⚅'
        };
        
        let description = '';
        if (quantity === 1) {
            const emoji = sides <= 6 ? diceEmojis[results[0]] : '🎲';
            description = `${emoji} **${results[0]}**`;
        } else {
            description = results.map((result, index) => {
                const emoji = sides <= 6 ? diceEmojis[result] : '🎲';
                return `${emoji} **${result}**`;
            }).join(' + ');
            description += `\n\n**Total: ${total}**`;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎲 Dados')
            .setDescription(description)
            .addFields(
                { name: '📊 Configuração', value: `\`${quantity} dado(s) de ${sides} lados\``, inline: true },
                { name: '🎯 Resultado', value: `\`${results.join(', ')}\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Rolado por ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
