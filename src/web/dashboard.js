const express = require('express');
const cors = require('cors');
const path = require('path');

class WebDashboard {
    constructor(client) {
        this.client = client;
        this.app = express();
        this.port = process.env.PORT || 3000;
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // Página principal
        this.app.get('/', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Dashboard - ${this.client.user?.username || 'Bot Discord'}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                            color: white;
                        }
                        .container { 
                            max-width: 1200px; 
                            margin: 0 auto; 
                            padding: 20px; 
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 40px; 
                        }
                        .header h1 { 
                            font-size: 3rem; 
                            margin-bottom: 10px; 
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                        }
                        .header p { 
                            font-size: 1.2rem; 
                            opacity: 0.9; 
                        }
                        .stats-grid { 
                            display: grid; 
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                            gap: 20px; 
                            margin-bottom: 40px; 
                        }
                        .stat-card { 
                            background: rgba(255,255,255,0.1); 
                            padding: 20px; 
                            border-radius: 15px; 
                            backdrop-filter: blur(10px); 
                            border: 1px solid rgba(255,255,255,0.2);
                            transition: transform 0.3s ease;
                        }
                        .stat-card:hover { 
                            transform: translateY(-5px); 
                        }
                        .stat-card h3 { 
                            font-size: 1.5rem; 
                            margin-bottom: 10px; 
                            color: #ffd700; 
                        }
                        .stat-card .value { 
                            font-size: 2rem; 
                            font-weight: bold; 
                            margin-bottom: 5px; 
                        }
                        .stat-card .description { 
                            opacity: 0.8; 
                            font-size: 0.9rem; 
                        }
                        .features { 
                            background: rgba(255,255,255,0.1); 
                            padding: 30px; 
                            border-radius: 15px; 
                            backdrop-filter: blur(10px); 
                            border: 1px solid rgba(255,255,255,0.2);
                        }
                        .features h2 { 
                            text-align: center; 
                            margin-bottom: 30px; 
                            font-size: 2rem; 
                            color: #ffd700; 
                        }
                        .features-grid { 
                            display: grid; 
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                            gap: 20px; 
                        }
                        .feature { 
                            text-align: center; 
                            padding: 20px; 
                            background: rgba(255,255,255,0.05); 
                            border-radius: 10px; 
                            border: 1px solid rgba(255,255,255,0.1);
                        }
                        .feature-icon { 
                            font-size: 2.5rem; 
                            margin-bottom: 10px; 
                        }
                        .feature h3 { 
                            margin-bottom: 10px; 
                            color: #ffd700; 
                        }
                        .feature p { 
                            opacity: 0.8; 
                            font-size: 0.9rem; 
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 40px; 
                            opacity: 0.7; 
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🤖 Dashboard do Bot</h1>
                            <p>Painel de controle e estatísticas</p>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <h3>📊 Servidores</h3>
                                <div class="value">${this.client.guilds.cache.size}</div>
                                <div class="description">Servidores conectados</div>
                            </div>
                            
                            <div class="stat-card">
                                <h3>👥 Usuários</h3>
                                <div class="value">${this.client.users.cache.size}</div>
                                <div class="description">Usuários únicos</div>
                            </div>
                            
                            <div class="stat-card">
                                <h3>⚡ Comandos</h3>
                                <div class="value">${this.client.commands.size}</div>
                                <div class="description">Comandos disponíveis</div>
                            </div>
                            
                            <div class="stat-card">
                                <h3>🕐 Uptime</h3>
                                <div class="value">${Math.floor(process.uptime() / 3600)}h</div>
                                <div class="description">Tempo online</div>
                            </div>
                        </div>
                        
                        <div class="features">
                            <h2>🚀 Funcionalidades</h2>
                            <div class="features-grid">
                                <div class="feature">
                                    <div class="feature-icon">🎨</div>
                                    <h3>Geração de Imagens</h3>
                                    <p>IA para criar imagens incríveis</p>
                                </div>
                                
                                <div class="feature">
                                    <div class="feature-icon">💰</div>
                                    <h3>Sistema de Economia</h3>
                                    <p>Moedas, banco e loja virtual</p>
                                </div>
                                
                                <div class="feature">
                                    <div class="feature-icon">🎵</div>
                                    <h3>Player de Música</h3>
                                    <p>Reproduzir músicas do YouTube</p>
                                </div>
                                
                                <div class="feature">
                                    <div class="feature-icon">🎫</div>
                                    <h3>Sistema de Tickets</h3>
                                    <p>Suporte organizado</p>
                                </div>
                                
                                <div class="feature">
                                    <div class="feature-icon">🔨</div>
                                    <h3>Moderação</h3>
                                    <p>Ferramentas de administração</p>
                                </div>
                                
                                <div class="feature">
                                    <div class="feature-icon">📈</div>
                                    <h3>Sistema de Níveis</h3>
                                    <p>XP e ranking de usuários</p>
                                </div>
                                
                                <div class="feature">
                                    <div class="feature-icon">🎮</div>
                                    <h3>Comandos de Diversão</h3>
                                    <p>Jogos e entretenimento</p>
                                </div>
                                
                                <div class="feature">
                                    <div class="feature-icon">📊</div>
                                    <h3>Estatísticas</h3>
                                    <p>Monitoramento em tempo real</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>Bot Discord Modular - Desenvolvido com ❤️</p>
                        </div>
                    </div>
                </body>
                </html>
            `);
        });

        // API de estatísticas
        this.app.get('/api/stats', (req, res) => {
            const stats = {
                guilds: this.client.guilds.cache.size,
                users: this.client.users.cache.size,
                commands: this.client.commands.size,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                ping: this.client.ws.ping
            };
            res.json(stats);
        });

        // API de servidores
        this.app.get('/api/guilds', (req, res) => {
            const guilds = this.client.guilds.cache.map(guild => ({
                id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                owner: guild.ownerId,
                joinedAt: guild.joinedAt
            }));
            res.json(guilds);
        });

        // API de comandos
        this.app.get('/api/commands', (req, res) => {
            const commands = Array.from(this.client.commands.values()).map(cmd => ({
                name: cmd.data.name,
                description: cmd.data.description,
                category: cmd.data.category || 'Geral'
            }));
            res.json(commands);
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🌐 Dashboard web iniciado na porta ${this.port}`);
            console.log(`📊 Acesse: http://localhost:${this.port}`);
        });
    }
}

module.exports = WebDashboard;
