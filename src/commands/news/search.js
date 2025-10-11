const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('news')
        .setDescription('Busca notícias sobre cibersegurança')
        .addStringOption(option =>
            option.setName('busca')
                .setDescription('Termo para buscar nas notícias')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('limite')
                .setDescription('Número máximo de notícias (1-10)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)),

    async execute(interaction) {
        const query = interaction.options.getString('busca');
        const limit = interaction.options.getInteger('limite') || 5;
        const newsSystem = interaction.client.newsSystem;
        
        await interaction.deferReply();

        try {
            const news = await newsSystem.searchNews(query, limit);
            
            if (news.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ff4444')
                    .setTitle('📰 Nenhuma Notícia Encontrada')
                    .setDescription(`Não foram encontradas notícias para: **${query}**`)
                    .addFields(
                        { name: '💡 Dicas', value: '• Tente termos mais gerais\n• Use palavras em inglês\n• Verifique a ortografia', inline: false }
                    )
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle(`📰 Resultados para: ${query}`)
                .setDescription(`Encontradas **${news.length}** notícias`)
                .setTimestamp()
                .setFooter({ text: 'Skynet Cibersegurança' });

            // Adicionar notícias como campos
            news.forEach((item, index) => {
                const description = item.description.length > 200 ? 
                    item.description.substring(0, 200) + '...' : 
                    item.description;

                embed.addFields({
                    name: `${index + 1}. ${item.title}`,
                    value: `**Fonte:** ${item.source}\n**Data:** <t:${Math.floor(item.pubDate.getTime() / 1000)}:R>\n**Descrição:** ${description}\n**Link:** [Ler mais](${item.link})`,
                    inline: false
                });
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro no comando news:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro na Busca')
                .setDescription('Ocorreu um erro ao buscar notícias. Tente novamente mais tarde.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
