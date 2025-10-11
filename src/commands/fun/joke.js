const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Conte uma piada aleatória'),

    async execute(interaction) {
        const jokes = [
            {
                setup: 'Por que os pássaros voam para o sul no inverno?',
                punchline: 'Porque é longe demais para ir andando! 😄'
            },
            {
                setup: 'O que o pato disse para a pata?',
                punchline: 'Vem quá! 🦆'
            },
            {
                setup: 'Por que o livro de matemática estava triste?',
                punchline: 'Porque tinha muitos problemas! 📚'
            },
            {
                setup: 'O que a impressora falou para a outra impressora?',
                punchline: 'Essa folha é sua ou é impressão minha? 🖨️'
            },
            {
                setup: 'Por que o esqueleto não brigou com ninguém?',
                punchline: 'Porque não tinha estômago para isso! 💀'
            },
            {
                setup: 'O que o zero disse para o oito?',
                punchline: 'Que cinto legal! 🔢'
            },
            {
                setup: 'Por que o gato não gosta de água?',
                punchline: 'Porque ele não quer se molhar! 🐱'
            },
            {
                setup: 'O que o tomate foi fazer no banco?',
                punchline: 'Fazer um depósito! 🍅'
            },
            {
                setup: 'Por que o pão foi ao médico?',
                punchline: 'Porque estava se sentindo meio duro! 🍞'
            },
            {
                setup: 'O que o pato disse quando comprou um desodorante?',
                punchline: 'Cheirou bem! 🦆'
            }
        ];

        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('😄 Piada do Dia')
            .addFields(
                { name: '❓', value: joke.setup, inline: false },
                { name: '😆', value: joke.punchline, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Contada para ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
