// ==========================================
// NEON PULSE: Space Arcade Shooter - Game JS
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startOverlay = document.getElementById('start-overlay');
const gameOverOverlay = document.getElementById('gameover-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const scoreDisplay = document.getElementById('score-value');
const waveDisplay = document.getElementById('wave-value');
const highscoreDisplay = document.getElementById('highscore-value');
const finalScoreDisplay = document.getElementById('final-score');
const finalWaveDisplay = document.getElementById('final-wave');
const finalHighscoreDisplay = document.getElementById('final-highscore');
const healthBarFill = document.getElementById('health-bar-fill');

// Sound Synthesizer using Web Audio API (No external sound files required)
class SoundFX {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }

    playLaser() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playExplosion() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }

    playPowerup() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playGameOver() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
    }
}

const sfx = new SoundFX();

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let score = 0;
let highscore = parseInt(localStorage.getItem('neon_pulse_highscore')) || 0;
let wave = 1;
let waveTimer = 0;
let enemiesToSpawn = 0;
let spawnInterval = 60;
let frameCount = 0;

// Highscore display init
highscoreDisplay.textContent = highscore;

// Canvas scaling
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = 800;
    canvas.height = 600;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Controls
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

// Touch and Mouse support
let isDragging = false;
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePlayerTargetFromEvent(e);
});
canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updatePlayerTargetFromEvent(e);
    }
});
window.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    updatePlayerTargetFromEvent(e.touches[0]);
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (isDragging) {
        updatePlayerTargetFromEvent(e.touches[0]);
    }
    e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', () => isDragging = false);

function updatePlayerTargetFromEvent(e) {
    if (gameState !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    player.x += (x - player.x) * 0.25;
    player.y += (y - player.y) * 0.25;
}

// Background Starfield
class Star {
    constructor() {
        this.reset(true);
    }

    reset(randomY = false) {
        this.x = Math.random() * canvas.width;
        this.y = randomY ? Math.random() * canvas.height : 0;
        this.size = Math.random() * 2 + 0.5;
        this.speed = this.size * 1.5;
        this.alpha = Math.random() * 0.7 + 0.3;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(180, 240, 255, ${this.alpha})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

const stars = Array.from({ length: 80 }, () => new Star());

// Player Ship
class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.speed = 6;
        this.maxHealth = 100;
        this.health = 100;
        this.shootCooldown = 0;
        this.shootInterval = 12; // Frames between shots
        this.powerups = {
            doubleShot: 0,
            rapidFire: 0,
            shield: 0
        };
    }

    update() {
        // Movement
        if (keys.ArrowUp || keys.KeyW) this.y -= this.speed;
        if (keys.ArrowDown || keys.KeyS) this.y += this.speed;
        if (keys.ArrowLeft || keys.KeyA) this.x -= this.speed;
        if (keys.ArrowRight || keys.KeyD) this.x += this.speed;

        // Boundaries
        this.x = Math.max(this.width / 2, Math.min(canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(canvas.height - this.height / 2, this.y));

        // Powerup Timers
        if (this.powerups.doubleShot > 0) this.powerups.doubleShot--;
        if (this.powerups.rapidFire > 0) this.powerups.rapidFire--;
        if (this.powerups.shield > 0) this.powerups.shield--;

        // Auto Shoot
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        } else {
            this.shoot();
            this.shootCooldown = this.powerups.rapidFire > 0 ? 6 : this.shootInterval;
        }

        // Engine particle trail
        if (Math.random() > 0.3) {
            particles.push(new Particle(this.x, this.y + 18, '#66fcf1', 1, 2, 2, 0.05));
        }
    }

    shoot() {
        sfx.playLaser();
        if (this.powerups.doubleShot > 0) {
            lasers.push(new Laser(this.x - 12, this.y - 15));
            lasers.push(new Laser(this.x + 12, this.y - 15));
        } else {
            lasers.push(new Laser(this.x, this.y - 20));
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Shield glow
        if (this.powerups.shield > 0) {
            ctx.strokeStyle = '#66fcf1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 32, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(102, 252, 241, 0.15)';
            ctx.fill();
        }

        // Ship Body (Neon Futuristic Jet)
        ctx.strokeStyle = '#66fcf1';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#0b0c10';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#66fcf1';

        ctx.beginPath();
        ctx.moveTo(0, -22);      // Nose
        ctx.lineTo(20, 18);      // Right wing tip
        ctx.lineTo(8, 12);       // Right inner wing
        ctx.lineTo(0, 18);       // Center thruster
        ctx.lineTo(-8, 12);      // Left inner wing
        ctx.lineTo(-20, 18);     // Left wing tip
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit canopy glow
        ctx.fillStyle = '#45a29e';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(5, 5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    takeDamage(amount) {
        if (this.powerups.shield > 0) {
            // Shield absorbs damage
            return;
        }
        this.health = Math.max(0, this.health - amount);
        updateHealthBar();
        // Shake particles
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(this.x, this.y, '#ff4b4b', 2, 4, 3, 0.08));
        }
        if (this.health <= 0) {
            gameOver();
        }
    }
}

// Laser Shot
class Laser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 16;
        this.speed = 13;
        this.markedForDeletion = false;
    }

    update() {
        this.y -= this.speed;
        if (this.y < -30) this.markedForDeletion = true;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = '#66fcf1';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#66fcf1';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

// Enemy Ships
class Enemy {
    constructor(type = 'scout') {
        this.type = type;
        this.width = type === 'boss' ? 70 : 36;
        this.height = type === 'boss' ? 60 : 36;
        this.x = Math.random() * (canvas.width - 80) + 40;
        this.y = -50;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = type === 'scout' ? Math.random() * 2 + 1.8 : 1.2;
        this.health = type === 'boss' ? 12 : (type === 'cruiser' ? 3 : 1);
        this.maxHealth = this.health;
        this.color = type === 'boss' ? '#ff3b30' : (type === 'cruiser' ? '#ff9500' : '#ff2a6d');
        this.scoreValue = type === 'boss' ? 150 : (type === 'cruiser' ? 30 : 10);
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 30 || this.x > canvas.width - 30) {
            this.speedX *= -1;
        }

        if (this.y > canvas.height + 50) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.fillStyle = '#0b0c10';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        if (this.type === 'scout') {
            // Triangle scout
            ctx.moveTo(0, 18);
            ctx.lineTo(18, -14);
            ctx.lineTo(0, -6);
            ctx.lineTo(-18, -14);
        } else if (this.type === 'cruiser') {
            // Hexagonal cruiser
            ctx.moveTo(0, 20);
            ctx.lineTo(18, 5);
            ctx.lineTo(15, -15);
            ctx.lineTo(-15, -15);
            ctx.lineTo(-18, 5);
        } else if (this.type === 'boss') {
            // Large boss ship
            ctx.moveTo(0, 30);
            ctx.lineTo(35, 10);
            ctx.lineTo(25, -25);
            ctx.lineTo(0, -15);
            ctx.lineTo(-25, -25);
            ctx.lineTo(-35, 10);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Small health indicator for bosses/cruisers
        if (this.maxHealth > 1) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(-15, -25, 30, 4);
            ctx.fillStyle = this.color;
            ctx.fillRect(-15, -25, 30 * (this.health / this.maxHealth), 4);
        }

        ctx.restore();
    }
}

// Powerups
class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'doubleShot', 'rapidFire', 'shield', 'heal'
        this.width = 24;
        this.height = 24;
        this.speedY = 1.5;
        this.markedForDeletion = false;
        this.color = type === 'shield' ? '#66fcf1' : (type === 'heal' ? '#00e676' : '#ffea00');
    }

    update() {
        this.y += this.speedY;
        if (this.y > canvas.height + 30) this.markedForDeletion = true;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(11, 12, 16, 0.8)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let label = '2X';
        if (this.type === 'rapidFire') label = 'RF';
        if (this.type === 'shield') label = 'SH';
        if (this.type === 'heal') label = '+H';
        ctx.fillText(label, 0, 0);

        ctx.restore();
    }
}

// Particle system for explosions and visual juice
class Particle {
    constructor(x, y, color, speed, size, life, fade) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * (Math.random() * speed);
        this.vy = Math.sin(angle) * (Math.random() * speed);
        this.size = Math.random() * size + 1;
        this.alpha = 1;
        this.fade = fade || 0.03;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.fade;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// Entities Arrays
let player = new Player();
let lasers = [];
let enemies = [];
let powerups = [];
let particles = [];

function updateHealthBar() {
    const percent = Math.max(0, (player.health / player.maxHealth) * 100);
    healthBarFill.style.width = percent + '%';
    if (percent < 30) {
        healthBarFill.style.background = '#ff3b30';
    } else {
        healthBarFill.style.background = 'linear-gradient(90deg, #66fcf1, #45a29e)';
    }
}

function spawnWave() {
    enemiesToSpawn = wave * 4 + 3;
    spawnInterval = Math.max(20, 60 - wave * 4);
}

function spawnEnemy() {
    if (enemiesToSpawn <= 0) return;

    let type = 'scout';
    if (wave >= 2 && Math.random() < 0.3) type = 'cruiser';
    if (wave >= 3 && enemiesToSpawn === 1 && Math.random() < 0.8) type = 'boss';

    enemies.push(new Enemy(type));
    enemiesToSpawn--;
}

function addScore(pts) {
    score += pts;
    scoreDisplay.textContent = score;
    if (score > highscore) {
        highscore = score;
        highscoreDisplay.textContent = highscore;
        localStorage.setItem('neon_pulse_highscore', highscore);
    }
}

function checkCollisions() {
    // 1. Lasers hit enemies
    lasers.forEach(laser => {
        enemies.forEach(enemy => {
            if (
                Math.abs(laser.x - enemy.x) < (enemy.width / 2 + laser.width / 2) &&
                Math.abs(laser.y - enemy.y) < (enemy.height / 2 + laser.height / 2)
            ) {
                laser.markedForDeletion = true;
                enemy.health--;

                // Hit spark
                particles.push(new Particle(laser.x, laser.y, '#66fcf1', 3, 3, 3, 0.08));

                if (enemy.health <= 0) {
                    enemy.markedForDeletion = true;
                    sfx.playExplosion();
                    addScore(enemy.scoreValue);

                    // Explosion particles
                    for (let i = 0; i < 20; i++) {
                        particles.push(new Particle(enemy.x, enemy.y, enemy.color, 4, 4, 3, 0.04));
                    }

                    // Chance to drop powerup
                    if (Math.random() < 0.22) {
                        const types = ['doubleShot', 'rapidFire', 'shield', 'heal'];
                        const picked = types[Math.floor(Math.random() * types.length)];
                        powerups.push(new Powerup(enemy.x, enemy.y, picked));
                    }
                }
            }
        });
    });

    // 2. Enemies hit Player
    enemies.forEach(enemy => {
        if (
            Math.abs(enemy.x - player.x) < (enemy.width / 2 + player.width / 2 - 8) &&
            Math.abs(enemy.y - player.y) < (enemy.height / 2 + player.height / 2 - 8)
        ) {
            enemy.markedForDeletion = true;
            sfx.playExplosion();
            player.takeDamage(enemy.type === 'boss' ? 35 : 20);

            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(enemy.x, enemy.y, '#ff3b30', 4, 4, 3, 0.05));
            }
        }
    });

    // 3. Player collects Powerups
    powerups.forEach(p => {
        if (
            Math.abs(p.x - player.x) < (player.width / 2 + p.width / 2) &&
            Math.abs(p.y - player.y) < (player.height / 2 + p.height / 2)
        ) {
            p.markedForDeletion = true;
            sfx.playPowerup();

            if (p.type === 'doubleShot') player.powerups.doubleShot = 350;
            if (p.type === 'rapidFire') player.powerups.rapidFire = 350;
            if (p.type === 'shield') player.powerups.shield = 400;
            if (p.type === 'heal') {
                player.health = Math.min(player.maxHealth, player.health + 30);
                updateHealthBar();
            }

            // Powerup collection particles
            for (let i = 0; i < 12; i++) {
                particles.push(new Particle(p.x, p.y, p.color, 3, 3, 3, 0.05));
            }
        }
    });
}

function updateGame() {
    frameCount++;

    // Background stars update
    stars.forEach(star => star.update());

    if (gameState !== 'PLAYING') return;

    // Spawn wave enemies
    if (enemiesToSpawn > 0 && frameCount % spawnInterval === 0) {
        spawnEnemy();
    } else if (enemiesToSpawn === 0 && enemies.length === 0) {
        // Wave clear! Start next wave
        wave++;
        waveDisplay.textContent = wave;
        spawnWave();
    }

    // Update Entities
    player.update();
    lasers.forEach(l => l.update());
    enemies.forEach(e => e.update());
    powerups.forEach(p => p.update());
    particles.forEach(p => p.update());

    // Filter dead entities
    lasers = lasers.filter(l => !l.markedForDeletion);
    enemies = enemies.filter(e => !e.markedForDeletion);
    powerups = powerups.filter(p => !p.markedForDeletion);
    particles = particles.filter(p => p.alpha > 0);

    // Collisions
    checkCollisions();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw starfield
    stars.forEach(star => star.draw());

    if (gameState === 'PLAYING' || gameState === 'GAMEOVER') {
        powerups.forEach(p => p.draw());
        lasers.forEach(l => l.draw());
        enemies.forEach(e => e.draw());
        particles.forEach(p => p.draw());
        player.draw();
    }
}

function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    sfx.init();
    gameState = 'PLAYING';
    score = 0;
    wave = 1;
    scoreDisplay.textContent = '0';
    waveDisplay.textContent = '1';
    player.reset();
    updateHealthBar();
    lasers = [];
    enemies = [];
    powerups = [];
    particles = [];
    spawnWave();

    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
}

function gameOver() {
    sfx.playGameOver();
    gameState = 'GAMEOVER';
    finalScoreDisplay.textContent = score;
    finalWaveDisplay.textContent = wave;
    finalHighscoreDisplay.textContent = highscore;
    gameOverOverlay.classList.remove('hidden');
}

// Event Listeners for Buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Touch UI buttons for mobile
document.getElementById('btn-left').addEventListener('touchstart', (e) => { keys.ArrowLeft = true; e.preventDefault(); });
document.getElementById('btn-left').addEventListener('touchend', () => { keys.ArrowLeft = false; });

document.getElementById('btn-right').addEventListener('touchstart', (e) => { keys.ArrowRight = true; e.preventDefault(); });
document.getElementById('btn-right').addEventListener('touchend', () => { keys.ArrowRight = false; });

document.getElementById('btn-fire').addEventListener('touchstart', (e) => { 
    if (gameState === 'PLAYING') player.shoot(); 
    e.preventDefault(); 
});

// Start loop
gameLoop();
