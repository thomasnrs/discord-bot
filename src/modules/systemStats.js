const os = require('os');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

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
        
        // Calcular load average (se disponível)
        const loadAvg = os.loadavg();
        const cpuLoad = loadAvg[0] ? `${loadAvg[0].toFixed(2)}` : 'N/A';

        // Informações de plataforma
        const platform = os.platform();
        const arch = os.arch();
        const nodeVersion = process.version;
        
        // Informações de processo
        const processUptime = process.uptime();
        const processMemory = process.memoryUsage();
        
        // Informações de rede (interfaces)
        const networkInterfaces = os.networkInterfaces();
        let networkInfo = 'N/A';
        if (networkInterfaces) {
            const interfaces = Object.keys(networkInterfaces);
            networkInfo = interfaces.length > 0 ? interfaces[0] : 'N/A';
        }
        
        // Informações de usuário do sistema
        const systemUser = os.userInfo();
        const hostname = os.hostname();
        
        // Informações de disco (aproximação)
        let diskInfo = 'N/A';
        try {
            const stats = fs.statSync('/');
            diskInfo = 'Disponível';
        } catch (error) {
            diskInfo = 'Indisponível';
        }

        return {
            uptime: formatUptime(),
            uptimeMs: uptime,
            memory: {
                total: this.formatBytes(totalMem),
                used: this.formatBytes(usedMem),
                free: this.formatBytes(freeMem),
                usagePercent: memUsagePercent,
                process: this.formatBytes(processMemory.heapUsed)
            },
            cpu: {
                model: cpuModel,
                cores: cpuCores,
                platform: platform,
                arch: arch,
                load: cpuLoad
            },
            node: {
                version: nodeVersion,
                uptime: Math.floor(processUptime)
            },
            system: {
                hostname: hostname,
                user: systemUser.username,
                network: networkInfo,
                disk: diskInfo
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
                    name: '💾 Memória Sistema',
                    value: `\`${stats.memory.used}/${stats.memory.total}\`\n\`${stats.memory.usagePercent}% usado\``,
                    inline: true
                },
                {
                    name: '🧠 Memória Processo',
                    value: `\`${stats.memory.process} heap\``,
                    inline: true
                },
                {
                    name: '🖥️ CPU',
                    value: `\`${stats.cpu.cores} cores\`\n\`Load: ${stats.cpu.load}\``,
                    inline: true
                },
                {
                    name: '📈 Atividade',
                    value: `\`${stats.bot.commands} comandos\`\n\`${stats.bot.messages} mensagens\``,
                    inline: true
                },
                {
                    name: '🖥️ Sistema',
                    value: `\`${stats.system.hostname}\`\n\`${stats.system.user}@${stats.cpu.platform}\``,
                    inline: true
                },
                {
                    name: '🌐 Rede',
                    value: `\`${stats.system.network}\`\n\`${stats.system.disk}\``,
                    inline: true
                },
                {
                    name: '⚙️ Runtime',
                    value: `\`Node.js ${stats.node.version}\`\n\`Uptime: ${stats.node.uptime}s\``,
                    inline: true
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
