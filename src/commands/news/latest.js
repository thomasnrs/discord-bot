const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latest')
        .setDescription('Mostra as últimas notícias de cibersegurança')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Número de notícias (1-10)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)),

    async execute(interaction) {
        const quantity = interaction.options.getInteger('quantidade') || 5;
        const newsSystem = interaction.client.newsSystem;
        
        await interaction.deferReply();

        try {
            // Buscar notícias recentes
            const allNews = [];
            
            for (const source of newsSystem.newsSources) {
                try {
                    const news = await newsSystem.fetchNewsFromSource(source);
                    allNews.push(...news);
                } catch (error) {
                    console.error(`❌ Erro ao buscar de ${source.name}:`, error.message);
                }
            }

            // Filtrar e ordenar
            const filteredNews = newsSystem.filterAndSortNews(allNews);
            const latestNews = filteredNews.slice(0, quantity);
            
            if (latestNews.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ff8800')
                    .setTitle('📰 Nenhuma Notícia Recente')
                    .setDescription('Não há notícias recentes disponíveis no momento.')
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('📰 Últimas Notícias de Cibersegurança')
                .setDescription(`Mostrando as **${latestNews.length}** notícias mais recentes`)
                .setTimestamp()
                .setFooter({ text: 'Skynet Cibersegurança • Atualizado automaticamente' });

            // Adicionar notícias como campos
            latestNews.forEach((item, index) => {
                const description = item.description.length > 150 ? 
                    item.description.substring(0, 150) + '...' : 
                    item.description;

                embed.addFields({
                    name: `${index + 1}. ${item.title}`,
                    value: `**Fonte:** ${item.source}\n**Data:** <t:${Math.floor(item.pubDate.getTime() / 1000)}:R>\n**Descrição:** ${description}\n**Link:** [Ler mais](${item.link})`,
                    inline: false
                });
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro no comando latest:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('❌ Erro ao Buscar Notícias')
                .setDescription('Ocorreu um erro ao buscar as últimas notícias. Tente novamente mais tarde.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
        
        // Incrementar contador de comandos
        interaction.client.systemStats.incrementCommandCount();
    },
};
