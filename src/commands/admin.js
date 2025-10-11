const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Comandos de administração do bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Mostra estatísticas do bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rate-limit')
                .setDescription('Mostra informações sobre rate limiting'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ping')
                .setDescription('Testa a latência do bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('servers')
                .setDescription('Lista servidores onde o bot está')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'stats':
                await this.handleStats(interaction);
                break;
            case 'rate-limit':
                await this.handleRateLimit(interaction);
                break;
            case 'ping':
                await this.handlePing(interaction);
                break;
            case 'servers':
                await this.handleServers(interaction);
                break;
        }
    },

    async handleStats(interaction) {
        const client = interaction.client;
        const stats = client.imageGenerator.getStats();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 Estatísticas do Bot')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '🤖 Bot', value: `**Nome:** ${client.user.username}\n**ID:** ${client.user.id}\n**Ping:** ${client.ws.ping}ms`, inline: true },
                { name: '🌐 Servidores', value: `**Total:** ${client.guilds.cache.size}\n**Usuários:** ${client.users.cache.size}`, inline: true },
                { name: '⚡ Uptime', value: this.formatUptime(client.uptime), inline: true },
                { name: '🖼️ Geração de Imagens', value: `**Usuários Ativos:** ${stats.activeUsers}\n**Requisições:** ${stats.totalRequests}\n**Limite por Usuário:** ${stats.maxRequestsPerUser}/min`, inline: true },
                { name: '💾 Memória', value: `**RAM:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n**Node.js:** ${process.version}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Estatísticas em tempo real' });

        await interaction.reply({ embeds: [embed] });
    },

    async handleRateLimit(interaction) {
        const stats = interaction.client.imageGenerator.getStats();

        const embed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('⏰ Rate Limiting')
            .setDescription('Informações sobre o sistema de rate limiting')
            .addFields(
                { name: '👥 Usuários Ativos', value: stats.activeUsers.toString(), inline: true },
                { name: '📊 Total de Requisições', value: stats.totalRequests.toString(), inline: true },
                { name: '🔒 Limite por Usuário', value: `${stats.maxRequestsPerUser} requisições`, inline: true },
                { name: '⏱️ Janela de Tempo', value: `${stats.rateLimitWindow / 1000} segundos`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handlePing(interaction) {
        const sent = await interaction.reply({ content: '🏓 Calculando ping...', fetchReply: true });
        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 Latência da API', value: `${interaction.client.ws.ping}ms`, inline: true },
                { name: '🔄 Roundtrip', value: `${roundtrip}ms`, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [embed] });
    },

    async handleServers(interaction) {
        const guilds = interaction.client.guilds.cache;
        const guildList = guilds.map(guild => 
            `**${guild.name}**\n👥 ${guild.memberCount} membros\n🆔 ${guild.id}`
        ).slice(0, 10); // Limitar a 10 servidores

        const embed = new EmbedBuilder()
            .setColor('#9932cc')
            .setTitle(`🌐 Servidores (${guilds.size} total)`)
            .setDescription(guildList.join('\n\n'))
            .setTimestamp();

        if (guilds.size > 10) {
            embed.setFooter({ text: `Mostrando 10 de ${guilds.size} servidores` });
        }

        await interaction.reply({ embeds: [embed] });
    },

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
};
