const { EmbedBuilder } = require('discord.js');
const Database = require('./database');

class Economy {
    constructor() {
        this.db = new Database();
        this.dailyAmount = 500;
        this.weeklyAmount = 2000;
        this.workAmounts = [100, 200, 300, 400, 500];
        this.crimeAmounts = [-200, -100, 0, 100, 200, 300, 400, 500];
    }

    // Obter dados do usuário
    getUserData(userId) {
        return this.db.getUserEconomy(userId);
    }

    // Salvar dados do usuário
    saveUserData(userId, userData) {
        return this.db.saveUserEconomy(userId, userData);
    }

    // Adicionar dinheiro
    addMoney(userId, amount, source = 'wallet') {
        const userData = this.getUserData(userId);
        
        if (source === 'wallet') {
            userData.money += amount;
        } else if (source === 'bank') {
            userData.bank += amount;
        }

        this.saveUserData(userId, userData);
        return userData;
    }

    // Remover dinheiro
    removeMoney(userId, amount, source = 'wallet') {
        const userData = this.getUserData(userId);
        
        if (source === 'wallet') {
            if (userData.money < amount) return false;
            userData.money -= amount;
        } else if (source === 'bank') {
            if (userData.bank < amount) return false;
            userData.bank -= amount;
        }

        this.saveUserData(userId, userData);
        return userData;
    }

    // Transferir dinheiro entre carteira e banco
    transferMoney(userId, amount, from, to) {
        const userData = this.getUserData(userId);
        
        if (from === 'wallet' && to === 'bank') {
            if (userData.money < amount) return false;
            userData.money -= amount;
            userData.bank += amount;
        } else if (from === 'bank' && to === 'wallet') {
            if (userData.bank < amount) return false;
            userData.bank -= amount;
            userData.money += amount;
        }

        this.saveUserData(userId, userData);
        return userData;
    }

    // Comando daily
    daily(userId) {
        const userData = this.getUserData(userId);
        const now = Date.now();
        const lastDaily = userData.daily;
        
        // Verificar se já fez daily hoje
        if (lastDaily && (now - lastDaily) < 86400000) { // 24 horas
            const timeLeft = 86400000 - (now - lastDaily);
            const hoursLeft = Math.floor(timeLeft / 3600000);
            const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);
            
            return {
                success: false,
                message: `Você já fez o daily hoje! Tente novamente em ${hoursLeft}h ${minutesLeft}m`,
                timeLeft: timeLeft
            };
        }

        // Dar daily
        userData.daily = now;
        userData.money += this.dailyAmount;
        this.saveUserData(userId, userData);

        return {
            success: true,
            message: `Você recebeu ${this.dailyAmount} moedas! 💰`,
            amount: this.dailyAmount
        };
    }

    // Comando weekly
    weekly(userId) {
        const userData = this.getUserData(userId);
        const now = Date.now();
        const lastWeekly = userData.weekly;
        
        // Verificar se já fez weekly esta semana
        if (lastWeekly && (now - lastWeekly) < 604800000) { // 7 dias
            const timeLeft = 604800000 - (now - lastWeekly);
            const daysLeft = Math.floor(timeLeft / 86400000);
            const hoursLeft = Math.floor((timeLeft % 86400000) / 3600000);
            
            return {
                success: false,
                message: `Você já fez o weekly esta semana! Tente novamente em ${daysLeft}d ${hoursLeft}h`,
                timeLeft: timeLeft
            };
        }

        // Dar weekly
        userData.weekly = now;
        userData.money += this.weeklyAmount;
        this.saveUserData(userId, userData);

        return {
            success: true,
            message: `Você recebeu ${this.weeklyAmount} moedas! 💰`,
            amount: this.weeklyAmount
        };
    }

    // Comando work
    work(userId) {
        const userData = this.getUserData(userId);
        const now = Date.now();
        const lastWork = userData.lastWork || 0;
        
        // Verificar cooldown (30 minutos)
        if (now - lastWork < 1800000) {
            const timeLeft = 1800000 - (now - lastWork);
            const minutesLeft = Math.floor(timeLeft / 60000);
            
            return {
                success: false,
                message: `Você precisa esperar ${minutesLeft} minutos para trabalhar novamente!`,
                timeLeft: timeLeft
            };
        }

        // Trabalhar
        const workAmount = this.workAmounts[Math.floor(Math.random() * this.workAmounts.length)];
        userData.money += workAmount;
        userData.lastWork = now;
        this.saveUserData(userId, userData);

        const workMessages = [
            'Você trabalhou como programador e ganhou',
            'Você fez freelances e ganhou',
            'Você vendeu artesanato e ganhou',
            'Você fez delivery e ganhou',
            'Você trabalhou em um projeto e ganhou'
        ];

        const workMessage = workMessages[Math.floor(Math.random() * workMessages.length)];

        return {
            success: true,
            message: `${workMessage} ${workAmount} moedas! 💼`,
            amount: workAmount
        };
    }

    // Comando crime
    crime(userId) {
        const userData = this.getUserData(userId);
        const now = Date.now();
        const lastCrime = userData.lastCrime || 0;
        
        // Verificar cooldown (1 hora)
        if (now - lastCrime < 3600000) {
            const timeLeft = 3600000 - (now - lastCrime);
            const minutesLeft = Math.floor(timeLeft / 60000);
            
            return {
                success: false,
                message: `Você precisa esperar ${minutesLeft} minutos para cometer um crime novamente!`,
                timeLeft: timeLeft
            };
        }

        // Cometer crime
        const crimeAmount = this.crimeAmounts[Math.floor(Math.random() * this.crimeAmounts.length)];
        userData.money += crimeAmount;
        userData.lastCrime = now;
        this.saveUserData(userId, userData);

        let crimeMessage;
        if (crimeAmount < 0) {
            crimeMessage = `Você foi pego e perdeu ${Math.abs(crimeAmount)} moedas! 🚨`;
        } else if (crimeAmount === 0) {
            crimeMessage = 'Você não conseguiu nada desta vez... 😔';
        } else {
            crimeMessage = `Você conseguiu ${crimeAmount} moedas! 🎭`;
        }

        return {
            success: true,
            message: crimeMessage,
            amount: crimeAmount
        };
    }

    // Criar embed de perfil
    createProfileEmbed(user, userData) {
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle(`💰 Perfil de ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '💵 Carteira', value: `\`${userData.money} moedas\``, inline: true },
                { name: '🏦 Banco', value: `\`${userData.bank} moedas\``, inline: true },
                { name: '📊 Total', value: `\`${userData.money + userData.bank} moedas\``, inline: true },
                { name: '📈 Nível', value: `\`${userData.level}\``, inline: true },
                { name: '⭐ XP', value: `\`${userData.xp}\``, inline: true },
                { name: '🎒 Inventário', value: `\`${userData.inventory.length} itens\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema de Economia' });

        return embed;
    }

    // Criar embed de leaderboard
    createLeaderboardEmbed(users, title = '🏆 Leaderboard') {
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle(title)
            .setTimestamp()
            .setFooter({ text: 'Sistema de Economia' });

        if (users.length === 0) {
            embed.setDescription('Nenhum usuário encontrado!');
            return embed;
        }

        let description = '';
        users.slice(0, 10).forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            description += `${medal} <@${user.userId}> - \`${user.money + user.bank} moedas\`\n`;
        });

        embed.setDescription(description);
        return embed;
    }
}

module.exports = Economy;
