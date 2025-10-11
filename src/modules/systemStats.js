const os = require('os');
const { EmbedBuilder } = require('discord.js');

class SystemStats {
    constructor() {
        this.startTime = Date.now();
        this.commandCount = 0;
        this.messageCount = 0;
    }

    // Incrementar contadores
    incrementCommandCount() {
        this.commandCount++;
    }

    incrementMessageCount() {
        this.messageCount++;
    }

    // Obter informações do sistema
    getSystemInfo() {
        const uptime = Date.now() - this.startTime;
        const uptimeSeconds = Math.floor(uptime / 1000);
        const uptimeMinutes = Math.floor(uptimeSeconds / 60);
        const uptimeHours = Math.floor(uptimeMinutes / 60);
        const uptimeDays = Math.floor(uptimeHours / 24);

        const formatUptime = () => {
            if (uptimeDays > 0) return `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m`;
            if (uptimeHours > 0) return `${uptimeHours}h ${uptimeMinutes % 60}m`;
            if (uptimeMinutes > 0) return `${uptimeMinutes}m ${uptimeSeconds % 60}s`;
            return `${uptimeSeconds}s`;
        };

        // Informações de memória
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

        // Informações de CPU
        const cpus = os.cpus();
        const cpuModel = cpus[0].model;
        const cpuCores = cpus.length;

        // Informações de plataforma
        const platform = os.platform();
        const arch = os.arch();
        const nodeVersion = process.version;

        return {
            uptime: formatUptime(),
            uptimeMs: uptime,
            memory: {
                total: this.formatBytes(totalMem),
                used: this.formatBytes(usedMem),
                free: this.formatBytes(freeMem),
                usagePercent: memUsagePercent
            },
            cpu: {
                model: cpuModel,
                cores: cpuCores,
                platform: platform,
                arch: arch
            },
            node: {
                version: nodeVersion
            },
            bot: {
                commands: this.commandCount,
                messages: this.messageCount
            }
        };
    }

    // Formatar bytes para formato legível
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Criar embed com as estatísticas
    createStatsEmbed(ping = null) {
        const stats = this.getSystemInfo();
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('📊 Estatísticas do Bot')
            .setTimestamp()
            .setFooter({ text: 'Atualizado automaticamente a cada 30 segundos' })
            .addFields(
                {
                    name: '🕐 Uptime',
                    value: `\`${stats.uptime}\``,
                    inline: true
                },
                {
                    name: '🏓 Ping',
                    value: ping ? `\`${ping}ms\`` : '`Calculando...`',
                    inline: true
                },
                {
                    name: '💾 Memória',
                    value: `\`${stats.memory.used}/${stats.memory.total}\`\n\`${stats.memory.usagePercent}% usado\``,
                    inline: true
                },
                {
                    name: '🖥️ CPU',
                    value: `\`${stats.cpu.cores} cores\`\n\`${stats.cpu.platform} ${stats.cpu.arch}\``,
                    inline: true
                },
                {
                    name: '📈 Comandos',
                    value: `\`${stats.bot.commands} executados\``,
                    inline: true
                },
                {
                    name: '💬 Mensagens',
                    value: `\`${stats.bot.messages} processadas\``,
                    inline: true
                },
                {
                    name: '⚙️ Sistema',
                    value: `\`Node.js ${stats.node.version}\`\n\`${stats.cpu.model}\``,
                    inline: false
                }
            );

        return embed;
    }

    // Criar embed de status do bot
    createStatusEmbed(ping = null) {
        const stats = this.getSystemInfo();
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🤖 Status do Bot')
            .setDescription('Bot funcionando normalmente! ✅')
            .setTimestamp()
            .addFields(
                {
                    name: '🟢 Status',
                    value: 'Online e funcionando',
                    inline: true
                },
                {
                    name: '🏓 Latência',
                    value: ping ? `${ping}ms` : 'Calculando...',
                    inline: true
                },
                {
                    name: '⏱️ Uptime',
                    value: stats.uptime,
                    inline: true
                },
                {
                    name: '💾 Uso de Memória',
                    value: `${stats.memory.usagePercent}%`,
                    inline: true
                },
                {
                    name: '📊 Comandos Executados',
                    value: stats.bot.commands.toString(),
                    inline: true
                },
                {
                    name: '🔄 Última Atualização',
                    value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                    inline: true
                }
            );

        return embed;
    }
}

module.exports = SystemStats;
