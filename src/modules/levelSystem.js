const { EmbedBuilder } = require('discord.js');

class LevelSystem {
    constructor() {
        this.xpPerMessage = 15;
        this.xpPerCommand = 25;
        this.xpPerVoiceMinute = 5;
        this.baseXpRequired = 100;
        this.xpMultiplier = 1.5;
    }

    // Calcular XP necessário para o próximo nível
    calculateXpRequired(level) {
        return Math.floor(this.baseXpRequired * Math.pow(this.xpMultiplier, level - 1));
    }

    // Calcular nível baseado no XP total
    calculateLevel(totalXp) {
        let level = 1;
        let xpNeeded = this.calculateXpRequired(level);
        
        while (totalXp >= xpNeeded) {
            totalXp -= xpNeeded;
            level++;
            xpNeeded = this.calculateXpRequired(level);
        }
        
        return level;
    }

    // Adicionar XP por mensagem
    addMessageXp(userId, db) {
        const userLevel = db.getUserLevel(userId);
        const oldLevel = userLevel.level;
        
        userLevel.xp += this.xpPerMessage;
        userLevel.totalXp += this.xpPerMessage;
        userLevel.messages++;
        
        const newLevel = this.calculateLevel(userLevel.totalXp);
        userLevel.level = newLevel;
        
        db.saveUserLevel(userId, userLevel);
        
        return {
            leveledUp: newLevel > oldLevel,
            newLevel: newLevel,
            oldLevel: oldLevel,
            xpGained: this.xpPerMessage
        };
    }

    // Adicionar XP por comando
    addCommandXp(userId, db) {
        const userLevel = db.getUserLevel(userId);
        const oldLevel = userLevel.level;
        
        userLevel.xp += this.xpPerCommand;
        userLevel.totalXp += this.xpPerCommand;
        userLevel.commands++;
        
        const newLevel = this.calculateLevel(userLevel.totalXp);
        userLevel.level = newLevel;
        
        db.saveUserLevel(userId, userLevel);
        
        return {
            leveledUp: newLevel > oldLevel,
            newLevel: newLevel,
            oldLevel: oldLevel,
            xpGained: this.xpPerCommand
        };
    }

    // Adicionar XP por tempo de voz
    addVoiceXp(userId, minutes, db) {
        const userLevel = db.getUserLevel(userId);
        const oldLevel = userLevel.level;
        
        const xpGained = minutes * this.xpPerVoiceMinute;
        userLevel.xp += xpGained;
        userLevel.totalXp += xpGained;
        userLevel.voiceTime += minutes;
        
        const newLevel = this.calculateLevel(userLevel.totalXp);
        userLevel.level = newLevel;
        
        db.saveUserLevel(userId, userLevel);
        
        return {
            leveledUp: newLevel > oldLevel,
            newLevel: newLevel,
            oldLevel: oldLevel,
            xpGained: xpGained
        };
    }

    // Obter progresso para o próximo nível
    getLevelProgress(userId, db) {
        const userLevel = db.getUserLevel(userId);
        const currentLevel = userLevel.level;
        const xpForCurrentLevel = this.calculateXpRequired(currentLevel);
        const xpForNextLevel = this.calculateXpRequired(currentLevel + 1);
        
        const xpInCurrentLevel = userLevel.totalXp - this.getTotalXpForLevel(currentLevel - 1);
        const xpNeededForNext = xpForNextLevel - this.getTotalXpForLevel(currentLevel - 1);
        
        const progress = (xpInCurrentLevel / xpNeededForNext) * 100;
        
        return {
            currentLevel: currentLevel,
            nextLevel: currentLevel + 1,
            xpInCurrentLevel: xpInCurrentLevel,
            xpNeededForNext: xpNeededForNext,
            progress: Math.min(progress, 100)
        };
    }

    // Calcular XP total necessário para alcançar um nível
    getTotalXpForLevel(level) {
        let totalXp = 0;
        for (let i = 1; i < level; i++) {
            totalXp += this.calculateXpRequired(i);
        }
        return totalXp;
    }

    // Criar embed de perfil de nível
    createLevelEmbed(user, userLevel, progress) {
        const progressBar = this.createProgressBar(progress.progress);
        
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle(`📊 Perfil de ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '📈 Nível', value: `\`${progress.currentLevel}\``, inline: true },
                { name: '⭐ XP Total', value: `\`${userLevel.totalXp}\``, inline: true },
                { name: '🎯 Próximo Nível', value: `\`${progress.nextLevel}\``, inline: true },
                { name: '📊 Progresso', value: `${progressBar} \`${progress.progress.toFixed(1)}%\``, inline: false },
                { name: '💬 Mensagens', value: `\`${userLevel.messages}\``, inline: true },
                { name: '⚡ Comandos', value: `\`${userLevel.commands}\``, inline: true },
                { name: '🎤 Tempo de Voz', value: `\`${Math.floor(userLevel.voiceTime / 60)}h\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema de Níveis' });

        return embed;
    }

    // Criar barra de progresso
    createProgressBar(percentage, length = 20) {
        const filled = Math.round((percentage / 100) * length);
        const empty = length - filled;
        
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    // Criar embed de leaderboard de níveis
    createLevelLeaderboard(users, title = '🏆 Ranking de Níveis') {
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle(title)
            .setTimestamp()
            .setFooter({ text: 'Sistema de Níveis' });

        if (users.length === 0) {
            embed.setDescription('Nenhum usuário encontrado!');
            return embed;
        }

        let description = '';
        users.slice(0, 10).forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            description += `${medal} <@${user.userId}> - \`Nível ${user.level}\` (\`${user.totalXp} XP\`)\n`;
        });

        embed.setDescription(description);
        return embed;
    }

    // Criar embed de level up
    createLevelUpEmbed(user, newLevel, oldLevel) {
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('🎉 Level Up!')
            .setDescription(`Parabéns ${user}! Você subiu para o nível **${newLevel}**!`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '📈 Nível Anterior', value: `\`${oldLevel}\``, inline: true },
                { name: '📈 Novo Nível', value: `\`${newLevel}\``, inline: true },
                { name: '🎯 Próximo Nível', value: `\`${newLevel + 1}\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema de Níveis' });

        return embed;
    }
}

module.exports = LevelSystem;
