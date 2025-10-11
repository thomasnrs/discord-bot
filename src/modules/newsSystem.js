const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const Parser = require('rss-parser');
const cron = require('node-cron');

class NewsSystem {
    constructor() {
        this.parser = new Parser();
        this.newsChannelId = '1426596564377403442'; // Canal jornal-skynet-cibesegurança
        this.updateInterval = '*/15 * * * *'; // A cada 15 minutos
        this.lastNewsIds = new Set();
        this.newsSources = [
            {
                name: 'BleepingComputer',
                url: 'https://www.bleepingcomputer.com/feed/',
                keywords: ['cybersecurity', 'data breach', 'hack', 'vulnerability', 'malware', 'ransomware']
            },
            {
                name: 'The Hacker News',
                url: 'https://feeds.feedburner.com/TheHackersNews',
                keywords: ['cybersecurity', 'data breach', 'hack', 'vulnerability', 'malware', 'ransomware']
            },
            {
                name: 'Krebs on Security',
                url: 'https://krebsonsecurity.com/feed/',
                keywords: ['cybersecurity', 'data breach', 'hack', 'vulnerability', 'malware', 'ransomware']
            },
            {
                name: 'Dark Reading',
                url: 'https://www.darkreading.com/rss.xml',
                keywords: ['cybersecurity', 'data breach', 'hack', 'vulnerability', 'malware', 'ransomware']
            },
            {
                name: 'SecurityWeek',
                url: 'https://www.securityweek.com/rss.xml',
                keywords: ['cybersecurity', 'data breach', 'hack', 'vulnerability', 'malware', 'ransomware']
            }
        ];
        
        this.keywords = [
            'data breach', 'vazamento de dados', 'cybersecurity', 'cibersegurança',
            'hack', 'hacker', 'vulnerability', 'vulnerabilidade', 'malware',
            'ransomware', 'phishing', 'discord', 'discord hack', 'discord breach',
            'security', 'segurança', 'privacy', 'privacidade', 'leak', 'vazamento',
            'incident', 'incidente', 'attack', 'ataque', 'exploit', 'exploração'
        ];
    }

    // Inicializar sistema de notícias
    init(client) {
        this.client = client;
        console.log('📰 Sistema de notícias inicializado');
        
        // Agendar busca automática de notícias
        this.scheduleNewsUpdates();
        
        // Buscar notícias imediatamente
        setTimeout(() => {
            this.fetchAndPostNews();
        }, 30000); // Aguardar 30 segundos após inicialização
    }

    // Agendar atualizações automáticas
    scheduleNewsUpdates() {
        cron.schedule(this.updateInterval, () => {
            console.log('📰 Executando busca automática de notícias...');
            this.fetchAndPostNews();
        });
        
        console.log(`📰 Notícias agendadas para atualização a cada 15 minutos`);
    }

    // Buscar e postar notícias
    async fetchAndPostNews() {
        try {
            const channel = this.client.channels.cache.get(this.newsChannelId);
            if (!channel) {
                console.log('❌ Canal de notícias não encontrado!');
                return;
            }

            const allNews = [];
            
            // Buscar notícias de todas as fontes
            for (const source of this.newsSources) {
                try {
                    const news = await this.fetchNewsFromSource(source);
                    allNews.push(...news);
                } catch (error) {
                    console.error(`❌ Erro ao buscar notícias de ${source.name}:`, error.message);
                }
            }

            // Filtrar e ordenar notícias
            const filteredNews = this.filterAndSortNews(allNews);
            
            // Postar notícias (máximo 3 por vez)
            const newsToPost = filteredNews.slice(0, 3);
            
            for (const news of newsToPost) {
                if (!this.lastNewsIds.has(news.id)) {
                    await this.postNews(channel, news);
                    this.lastNewsIds.add(news.id);
                    
                    // Aguardar 2 segundos entre posts
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            // Manter apenas os últimos 50 IDs para não sobrecarregar memória
            if (this.lastNewsIds.size > 50) {
                const idsArray = Array.from(this.lastNewsIds);
                this.lastNewsIds = new Set(idsArray.slice(-50));
            }

            console.log(`📰 ${newsToPost.length} notícias processadas`);

        } catch (error) {
            console.error('❌ Erro no sistema de notícias:', error);
        }
    }

    // Buscar notícias de uma fonte específica
    async fetchNewsFromSource(source) {
        try {
            const feed = await this.parser.parseURL(source.url);
            const news = [];

            for (const item of feed.items.slice(0, 10)) { // Pegar apenas as 10 mais recentes
                const newsItem = {
                    id: this.generateNewsId(item.link),
                    title: item.title,
                    link: item.link,
                    description: item.contentSnippet || item.content || '',
                    pubDate: new Date(item.pubDate),
                    source: source.name,
                    keywords: this.extractKeywords(item.title + ' ' + item.contentSnippet)
                };

                news.push(newsItem);
            }

            return news;
        } catch (error) {
            console.error(`❌ Erro ao buscar de ${source.name}:`, error.message);
            return [];
        }
    }

    // Filtrar e ordenar notícias
    filterAndSortNews(allNews) {
        return allNews
            .filter(news => {
                // Filtrar por relevância
                const text = (news.title + ' ' + news.description).toLowerCase();
                const isRelevant = this.keywords.some(keyword => 
                    text.includes(keyword.toLowerCase())
                );
                
                // Filtrar notícias muito antigas (mais de 24 horas)
                const isRecent = (Date.now() - news.pubDate.getTime()) < 24 * 60 * 60 * 1000;
                
                return isRelevant && isRecent;
            })
            .sort((a, b) => b.pubDate - a.pubDate) // Mais recentes primeiro
            .slice(0, 10); // Máximo 10 notícias
    }

    // Postar notícia no canal
    async postNews(channel, news) {
        try {
            const embed = this.createNewsEmbed(news);
            await channel.send({ embeds: [embed] });
            console.log(`📰 Notícia postada: ${news.title.substring(0, 50)}...`);
        } catch (error) {
            console.error('❌ Erro ao postar notícia:', error);
        }
    }

    // Criar embed da notícia
    createNewsEmbed(news) {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('📰 ' + news.title)
            .setURL(news.link)
            .setDescription(news.description.length > 500 ? 
                news.description.substring(0, 500) + '...' : 
                news.description
            )
            .addFields(
                { name: '📅 Data', value: `<t:${Math.floor(news.pubDate.getTime() / 1000)}:R>`, inline: true },
                { name: '📰 Fonte', value: news.source, inline: true },
                { name: '🔍 Palavras-chave', value: news.keywords.slice(0, 3).join(', '), inline: true }
            )
            .setFooter({ 
                text: 'Skynet Cibersegurança • Atualizado automaticamente a cada 15 minutos',
                iconURL: 'https://cdn.discordapp.com/emojis/1234567890123456789.png' // Emoji de segurança
            })
            .setTimestamp();

        return embed;
    }

    // Extrair palavras-chave do texto
    extractKeywords(text) {
        const foundKeywords = this.keywords.filter(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );
        return foundKeywords.slice(0, 5); // Máximo 5 palavras-chave
    }

    // Gerar ID único para notícia
    generateNewsId(url) {
        return Buffer.from(url).toString('base64').substring(0, 16);
    }

    // Buscar notícias manualmente
    async searchNews(query, limit = 5) {
        try {
            const allNews = [];
            
            for (const source of this.newsSources) {
                try {
                    const news = await this.fetchNewsFromSource(source);
                    allNews.push(...news);
                } catch (error) {
                    console.error(`❌ Erro ao buscar de ${source.name}:`, error.message);
                }
            }

            // Filtrar por query
            const filteredNews = allNews.filter(news => {
                const text = (news.title + ' ' + news.description).toLowerCase();
                return text.includes(query.toLowerCase());
            });

            return filteredNews.slice(0, limit);
        } catch (error) {
            console.error('❌ Erro na busca de notícias:', error);
            return [];
        }
    }

    // Obter estatísticas do sistema
    getStats() {
        return {
            sources: this.newsSources.length,
            keywords: this.keywords.length,
            lastNewsCount: this.lastNewsIds.size,
            updateInterval: this.updateInterval,
            channelId: this.newsChannelId
        };
    }
}

module.exports = NewsSystem;
