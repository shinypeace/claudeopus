// Main Game Engine
class CosmicShooter {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        this.isPlaying = false;
        this.isPaused = false;
        this.gameStartTime = 0;
        
        // Game state
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.health = 100;
        this.maxHealth = 100;
        this.killStreak = 0;
        this.lastKillTime = 0;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.explosions = [];
        this.environment = null;
        
        // Environmental events
        this.environmentEventTimer = 0;
        this.environmentEventInterval = 30; // 30 seconds
        
        // Managers
        this.weaponManager = null;
        this.enemyManager = null;
        this.powerupManager = null;
        this.audioManager = null;
        this.uiManager = null;
        this.particleSystem = null;
        this.postEffects = null;
        
        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        this.setupManagers();
        this.setupEventListeners();
        this.animate();
    }

    setupRenderer() {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // Set output encoding for compatibility
        if (THREE.sRGBEncoding) {
            this.renderer.outputEncoding = THREE.sRGBEncoding;
        } else if (THREE.SRGBColorSpace) {
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        }
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000033, 50, 500);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 0);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);

        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 100);
        pointLight1.position.set(25, 10, 25);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 100);
        pointLight2.position.set(-25, 10, -25);
        this.scene.add(pointLight2);
    }

    setupManagers() {
        this.environment = new Environment(this.scene);
        this.player = new Player(this.scene, this.camera);
        this.weaponManager = new WeaponManager(this.scene);
        this.enemyManager = new EnemyManager(this.scene);
        this.powerupManager = new PowerupManager(this.scene);
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager();
        this.particleSystem = new ParticleSystem(this.scene);
        // Note: PostEffects disabled for better compatibility
        // this.postEffects = new PostEffects(this.renderer, this.scene, this.camera);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Pointer lock for FPS controls
        document.addEventListener('click', () => {
            if (this.isPlaying && !this.isPaused) {
                document.body.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === document.body) {
                this.player.controls.enabled = true;
            } else {
                this.player.controls.enabled = false;
            }
        });
    }

    start() {
        this.isPlaying = true;
        this.isPaused = false;
        this.gameStartTime = Date.now();
        this.resetGame();
        document.body.requestPointerLock();
        this.audioManager.playBackgroundMusic();
    }

    pause() {
        this.isPaused = true;
        if (this.player.controls) {
            this.player.controls.enabled = false;
        }
        document.exitPointerLock();
        this.audioManager.pauseBackgroundMusic();
    }

    resume() {
        this.isPaused = false;
        document.body.requestPointerLock();
        this.audioManager.resumeBackgroundMusic();
    }

    restart() {
        this.resetGame();
        this.start();
    }

    resetGame() {
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.health = this.maxHealth;
        this.killStreak = 0;
        this.lastKillTime = 0;
        
        // Clear all game objects
        this.enemies.forEach(enemy => this.scene.remove(enemy.mesh));
        this.bullets.forEach(bullet => this.scene.remove(bullet.mesh));
        this.powerups.forEach(powerup => this.scene.remove(powerup.mesh));
        this.explosions.forEach(explosion => this.scene.remove(explosion.mesh));
        
        this.enemies = [];
        this.bullets = [];
        this.powerups = [];
        this.explosions = [];
        
        // Reset player
        this.player.reset();
        
        // Update UI
        this.uiManager.updateHUD(this.score, this.kills, this.wave, this.health);
        this.uiManager.updateHealthBar(this.health, this.maxHealth);
        this.uiManager.updateAmmoBar(this.weaponManager.currentWeapon.ammo, this.weaponManager.currentWeapon.maxAmmo);
    }

    gameOver() {
        this.isPlaying = false;
        this.isPaused = false;
        
        // Save stats
        this.saveStats();
        
        // Show game over screen
        document.getElementById('ui').classList.add('hidden');
        document.getElementById('gameOverMenu').classList.remove('hidden');
        document.getElementById('finalScore').textContent = `Ваш счет: ${this.score}`;
        
        const stats = JSON.parse(localStorage.getItem('cosmicShooterStats') || '{}');
        document.getElementById('highScore').textContent = `Лучший результат: ${stats.bestScore || 0}`;
        
        document.exitPointerLock();
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playGameOverSound();
    }

    saveStats() {
        const stats = JSON.parse(localStorage.getItem('cosmicShooterStats') || '{}');
        
        stats.bestScore = Math.max(stats.bestScore || 0, this.score);
        stats.totalGames = (stats.totalGames || 0) + 1;
        stats.totalKills = (stats.totalKills || 0) + this.kills;
        stats.totalTime = (stats.totalTime || 0) + Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        localStorage.setItem('cosmicShooterStats', JSON.stringify(stats));
    }

    takeDamage(damage) {
        this.health -= damage;
        this.health = Math.max(0, this.health);
        
        this.uiManager.updateHealthBar(this.health, this.maxHealth);
        this.uiManager.updateHUD(this.score, this.kills, this.wave, this.health);
        
        if (this.health <= 0) {
            this.gameOver();
        } else {
            this.audioManager.playHitSound();
            // Screen flash effect
            this.uiManager.flashScreen();
        }
    }

    addScore(points) {
        this.score += points;
        this.uiManager.updateHUD(this.score, this.kills, this.wave, this.health);
    }

    addKill() {
        this.kills++;
        this.addScore(100);
        
        // Kill streak system
        const currentTime = Date.now();
        if (currentTime - this.lastKillTime < 3000) { // 3 seconds for streak
            this.killStreak++;
        } else {
            this.killStreak = 1;
        }
        this.lastKillTime = currentTime;
        
        // Show kill streak notification
        this.uiManager.showKillStreak(this.killStreak);
        
        // Bonus points for kill streaks
        if (this.killStreak > 1) {
            this.addScore(this.killStreak * 25);
        }
        
        // Check for wave progression
        if (this.kills % 10 === 0) {
            this.wave++;
            this.enemyManager.increaseWave();
            this.uiManager.showWaveMessage(this.wave);
        }
        
        this.uiManager.updateHUD(this.score, this.kills, this.wave, this.health);
    }

    update() {
        if (!this.isPlaying || this.isPaused) return;

        const deltaTime = this.clock.getDelta();

        // Update all systems
        this.player.update(deltaTime);
        this.weaponManager.update(deltaTime);
        this.enemyManager.update(deltaTime, this.player.mesh.position);
        this.powerupManager.update(deltaTime);
        this.environment.update(deltaTime);

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);
            
            if (bullet.shouldRemove) {
                this.scene.remove(bullet.mesh);
                this.bullets.splice(i, 1);
                continue;
            }

            // Check collision with enemies
            this.enemies.forEach((enemy, enemyIndex) => {
                if (bullet.mesh.position.distanceTo(enemy.mesh.position) < 2) {
                    // Hit enemy
                    enemy.takeDamage(bullet.damage);
                    this.scene.remove(bullet.mesh);
                    this.bullets.splice(i, 1);
                    
                    // Show hit marker
                    this.uiManager.createHitMarker();
                    
                    // Create blood splatter effect
                    this.particleSystem.createBloodSplatter(
                        enemy.mesh.position.clone(),
                        bullet.direction
                    );
                    
                    if (enemy.health <= 0) {
                        this.scene.remove(enemy.mesh);
                        this.enemies.splice(enemyIndex, 1);
                        this.addKill();
                        this.audioManager.playEnemyDeathSound();
                        
                        // Create explosion effect
                        const explosion = new Explosion(enemy.mesh.position.clone());
                        this.scene.add(explosion.mesh);
                        this.explosions = this.explosions || [];
                        this.explosions.push(explosion);
                        
                        // Create shockwave for bigger enemies
                        if (enemy.type === 'boss' || enemy.type === 'heavy') {
                            this.particleSystem.createShockwave(
                                enemy.mesh.position.clone(),
                                enemy.type === 'boss' ? 2 : 1.5
                            );
                        }
                        
                        // Chance to spawn powerup
                        if (Math.random() < 0.3) {
                            this.powerupManager.spawnPowerup(enemy.mesh.position.clone());
                        }
                    } else {
                        this.audioManager.playHitSound();
                    }
                }
            });
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, this.player.mesh.position);
            
            // Check if enemy can attack player
            if (enemy.mesh.position.distanceTo(this.player.mesh.position) < enemy.attackRange) {
                if (enemy.canAttack()) {
                    this.takeDamage(enemy.damage);
                    enemy.attack();
                }
            }
        }

        // Update powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.update(deltaTime);
            
            // Check collision with player
            if (powerup.mesh.position.distanceTo(this.player.mesh.position) < 2) {
                this.applyPowerup(powerup);
                this.scene.remove(powerup.mesh);
                this.powerups.splice(i, 1);
                this.audioManager.playPowerupSound();
            }
            
            if (powerup.shouldRemove) {
                this.scene.remove(powerup.mesh);
                this.powerups.splice(i, 1);
            }
        }

        // Update explosions
        if (this.explosions) {
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                const explosion = this.explosions[i];
                explosion.update(deltaTime);
                
                if (explosion.shouldRemove) {
                    this.scene.remove(explosion.mesh);
                    this.explosions.splice(i, 1);
                }
            }
        }

        // Spawn new enemies
        this.enemyManager.spawnEnemies(this.enemies, this.player.mesh.position);

        // Update UI
        this.uiManager.updateAmmoBar(
            this.weaponManager.currentWeapon.ammo,
            this.weaponManager.currentWeapon.maxAmmo
        );
        
        // Update minimap and compass
        this.uiManager.createMiniMap(this.player.mesh.position, this.enemies, this.powerups);
        this.uiManager.createCompass(this.player.mesh.position, this.enemies);
        
        // Check for low health warning
        if (this.health < 30 && !document.getElementById('lowHealthWarning')) {
            this.uiManager.showLowHealthWarning();
        } else if (this.health >= 30) {
            this.uiManager.removeLowHealthWarning();
        }
        
        // Update crosshair based on enemy targeting
        const isTargeting = this.enemies.some(enemy => 
            enemy.mesh.position.distanceTo(this.player.mesh.position) < 30
        );
        this.uiManager.updateCrosshair(isTargeting);
        
        // Environmental events
        this.environmentEventTimer += deltaTime;
        if (this.environmentEventTimer >= this.environmentEventInterval) {
            this.environmentEventTimer = 0;
            this.environment.triggerRandomEvent();
        }
    }

    applyPowerup(powerup) {
        switch (powerup.type) {
            case 'health':
                this.health = Math.min(this.maxHealth, this.health + 25);
                this.uiManager.updateHealthBar(this.health, this.maxHealth);
                break;
            case 'ammo':
                this.weaponManager.currentWeapon.ammo = this.weaponManager.currentWeapon.maxAmmo;
                break;
            case 'damage':
                this.weaponManager.applyDamageBoost();
                break;
            case 'speed':
                this.player.applySpeedBoost();
                break;
        }
        
        this.addScore(50);
    }

    shoot() {
        if (this.weaponManager.canShoot()) {
            const shootResult = this.weaponManager.shoot(
                this.player.mesh.position.clone(),
                this.camera.getWorldDirection(new THREE.Vector3())
            );
            
            if (shootResult) {
                // Handle multiple bullets (for shotgun)
                if (Array.isArray(shootResult)) {
                    shootResult.forEach(bullet => {
                        this.bullets.push(bullet);
                        this.scene.add(bullet.mesh);
                    });
                } else {
                    this.bullets.push(shootResult);
                    this.scene.add(shootResult.mesh);
                }
                
                this.audioManager.playShootSound();
                
                // Create muzzle flash particles
                const muzzlePosition = this.player.mesh.position.clone();
                muzzlePosition.add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.5));
                this.particleSystem.createMuzzleFlashParticles(
                    muzzlePosition,
                    this.camera.getWorldDirection(new THREE.Vector3())
                );
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when all scripts are loaded
window.addEventListener('load', () => {
    window.game = new CosmicShooter();
});