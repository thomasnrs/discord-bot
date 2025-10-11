const { EmbedBuilder } = require('discord.js');

class CentralizedLogs {
    constructor() {
        this.logsChannelId = '1426433248556355666'; // Canal de logs centralizado
    }

    // Inicializar sistema de logs
    init(client) {
        this.client = client;
        console.log('📋 Sistema de logs centralizado inicializado');
    }

    // Enviar log genérico
    async sendLog(type, title, description, fields = [], color = '#7289da', user = null) {
        try {
            const channel = this.client.channels.cache.get(this.logsChannelId);
            if (!channel) {
                console.log('❌ Canal de logs não encontrado!');
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`${this.getTypeEmoji(type)} ${title}`)
                .setDescription(description)
                .setTimestamp()
                .setFooter({ text: 'Nebula Friends • Sistema de Logs' });

            // Adicionar campos se fornecidos
            if (fields.length > 0) {
                embed.addFields(fields);
            }

            // Adicionar informações do usuário se fornecido
            if (user) {
                embed.addFields({
                    name: '👤 Usuário',
                    value: user.tag || user.toString(),
                    inline: true
                });
            }

            await channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro ao enviar log centralizado:', error);
        }
    }

    // Log de verificação
    async logVerification(action, user, details = '') {
        const colors = {
            'verified': '#00ff88',
            'failed': '#ff4444',
            'timeout': '#ff8800'
        };

        const descriptions = {
            'verified': `Usuário ${user.tag} foi verificado com sucesso!`,
            'failed': `Falha na verificação do usuário ${user.tag}`,
            'timeout': `Timeout na verificação do usuário ${user.tag}`
        };

        await this.sendLog(
            'verification',
            `Verificação - ${action}`,
            descriptions[action] || details,
            [],
            colors[action] || '#7289da',
            user
        );
    }

    // Log de economia
    async logEconomy(action, user, amount = 0, details = '') {
        const colors = {
            'daily': '#00ff88',
            'work': '#0099ff',
            'crime_success': '#00ff88',
            'crime_fail': '#ff4444',
            'transfer_sent': '#ff8800',
            'transfer_received': '#00ff88'
        };

        const descriptions = {
            'daily': `Usuário ${user.tag} coletou ${amount} moedas diárias`,
            'work': `Usuário ${user.tag} trabalhou e ganhou ${amount} moedas`,
            'crime_success': `Usuário ${user.tag} cometeu crime e ganhou ${amount} moedas`,
            'crime_fail': `Usuário ${user.tag} tentou crime e perdeu ${amount} moedas`,
            'transfer_sent': `Usuário ${user.tag} enviou ${amount} moedas`,
            'transfer_received': `Usuário ${user.tag} recebeu ${amount} moedas`
        };

        await this.sendLog(
            'economy',
            `Economia - ${action}`,
            descriptions[action] || details,
            [
                { name: '💰 Quantia', value: `${amount} moedas`, inline: true }
            ],
            colors[action] || '#7289da',
            user
        );
    }

    // Log de moderação
    async logModeration(action, moderator, target, reason = '') {
        const colors = {
            'ban': '#ff4444',
            'kick': '#ff8800',
            'mute': '#ff8800',
            'warn': '#ff8800',
            'unban': '#00ff88',
            'unmute': '#00ff88'
        };

        const descriptions = {
            'ban': `Usuário ${target.tag} foi banido`,
            'kick': `Usuário ${target.tag} foi expulso`,
            'mute': `Usuário ${target.tag} foi silenciado`,
            'warn': `Usuário ${target.tag} foi advertido`,
            'unban': `Usuário ${target.tag} foi desbanido`,
            'unmute': `Usuário ${target.tag} foi desmuteado`
        };

        await this.sendLog(
            'moderation',
            `Moderação - ${action}`,
            descriptions[action] || `${action} executado`,
            [
                { name: '👤 Alvo', value: target.tag, inline: true },
                { name: '👨‍💼 Moderador', value: moderator.tag, inline: true },
                { name: '📝 Motivo', value: reason || 'Não especificado', inline: false }
            ],
            colors[action] || '#ff4444',
            moderator
        );
    }

    // Log de música
    async logMusic(action, user, details = '') {
        const colors = {
            'play': '#00ff88',
            'pause': '#ff8800',
            'stop': '#ff4444',
            'skip': '#0099ff',
            'queue': '#7289da'
        };

        await this.sendLog(
            'music',
            `Música - ${action}`,
            details,
            [],
            colors[action] || '#7289da',
            user
        );
    }

    // Log de níveis
    async logLevel(action, user, oldLevel = 0, newLevel = 0) {
        await this.sendLog(
            'level',
            `Nível - ${action}`,
            `Usuário ${user.tag} subiu do nível ${oldLevel} para ${newLevel}!`,
            [
                { name: '📈 Nível Anterior', value: oldLevel.toString(), inline: true },
                { name: '📈 Novo Nível', value: newLevel.toString(), inline: true }
            ],
            '#00ff88',
            user
        );
    }

    // Log de notícias
    async logNews(action, details = '') {
        const colors = {
            'fetched': '#00ff88',
            'posted': '#0099ff',
            'error': '#ff4444'
        };

        await this.sendLog(
            'news',
            `Notícias - ${action}`,
            details,
            [],
            colors[action] || '#7289da'
        );
    }

    // Log de sistema
    async logSystem(action, details = '') {
        const colors = {
            'startup': '#00ff88',
            'shutdown': '#ff4444',
            'error': '#ff4444',
            'warning': '#ff8800',
            'info': '#0099ff'
        };

        await this.sendLog(
            'system',
            `Sistema - ${action}`,
            details,
            [],
            colors[action] || '#7289da'
        );
    }

    // Obter emoji do tipo
    getTypeEmoji(type) {
        const emojis = {
            'verification': '🔐',
            'economy': '💰',
            'moderation': '🔨',
            'music': '🎵',
            'level': '📈',
            'news': '📰',
            'ticket': '🎫',
            'system': '⚙️'
        };
        return emojis[type] || '📋';
    }
}

module.exports = CentralizedLogs;
