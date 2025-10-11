const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Faça uma pergunta para a bola 8 mágica')
        .addStringOption(option =>
            option.setName('pergunta')
                .setDescription('Sua pergunta')
                .setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('pergunta');
        
        const responses = [
            { text: 'É certo!', color: '#00ff88' },
            { text: 'É decididamente assim.', color: '#00ff88' },
            { text: 'Sem dúvida.', color: '#00ff88' },
            { text: 'Sim, definitivamente.', color: '#00ff88' },
            { text: 'Você pode contar com isso.', color: '#00ff88' },
            { text: 'Como eu vejo, sim.', color: '#00ff88' },
            { text: 'Muito provável.', color: '#00ff88' },
            { text: 'Parece bom.', color: '#00ff88' },
            { text: 'Sim.', color: '#00ff88' },
            { text: 'Os sinais apontam para sim.', color: '#00ff88' },
            { text: 'Resposta nebulosa, tente novamente.', color: '#ff8800' },
            { text: 'Pergunte novamente mais tarde.', color: '#ff8800' },
            { text: 'Melhor não te dizer agora.', color: '#ff8800' },
            { text: 'Não é possível prever agora.', color: '#ff8800' },
            { text: 'Concentre-se e pergunte novamente.', color: '#ff8800' },
            { text: 'Não conte com isso.', color: '#ff4444' },
            { text: 'Minha resposta é não.', color: '#ff4444' },
            { text: 'Minhas fontes dizem não.', color: '#ff4444' },
            { text: 'As perspectivas não são tão boas.', color: '#ff4444' },
            { text: 'Muito duvidoso.', color: '#ff4444' }
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        
        const embed = new EmbedBuilder()
            .setColor(response.color)
            .setTitle('🎱 Bola 8 Mágica')
            .addFields(
                { name: '❓ Pergunta', value: question, inline: false },
                { name: '🔮 Resposta', value: response.text, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Perguntado por ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
