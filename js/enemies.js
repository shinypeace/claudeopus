// Enemy System
class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.spawnTimer = 0;
        this.spawnInterval = 3; // seconds
        this.maxEnemies = 15;
        this.waveMultiplier = 1;
        this.spawnRadius = 80;
    }
    
    spawnEnemies(enemies, playerPosition) {
        this.spawnTimer += 0.016; // ~60fps
        
        if (this.spawnTimer >= this.spawnInterval && enemies.length < this.maxEnemies) {
            this.spawnTimer = 0;
            
            // Determine enemy type based on wave
            let enemyType = 'basic';
            const rand = Math.random();
            
            if (this.waveMultiplier > 2) {
                if (rand < 0.1) enemyType = 'boss';
                else if (rand < 0.3) enemyType = 'heavy';
                else if (rand < 0.6) enemyType = 'fast';
            } else if (this.waveMultiplier > 1) {
                if (rand < 0.3) enemyType = 'fast';
                else if (rand < 0.5) enemyType = 'heavy';
            }
            
            const enemy = this.createEnemy(enemyType, playerPosition);
            enemies.push(enemy);
            this.scene.add(enemy.mesh);
        }
    }
    
    createEnemy(type, playerPosition) {
        // Spawn at random position around player
        const angle = Math.random() * Math.PI * 2;
        const distance = this.spawnRadius + Math.random() * 20;
        
        const spawnPosition = new THREE.Vector3(
            playerPosition.x + Math.cos(angle) * distance,
            1,
            playerPosition.z + Math.sin(angle) * distance
        );
        
        // Keep within planet bounds
        const maxBound = 90;
        spawnPosition.x = Math.max(-maxBound, Math.min(maxBound, spawnPosition.x));
        spawnPosition.z = Math.max(-maxBound, Math.min(maxBound, spawnPosition.z));
        
        switch (type) {
            case 'basic':
                return new BasicEnemy(spawnPosition);
            case 'fast':
                return new FastEnemy(spawnPosition);
            case 'heavy':
                return new HeavyEnemy(spawnPosition);
            case 'boss':
                return new BossEnemy(spawnPosition);
            default:
                return new BasicEnemy(spawnPosition);
        }
    }
    
    increaseWave() {
        this.waveMultiplier += 0.3;
        this.spawnInterval = Math.max(1, this.spawnInterval - 0.2);
        this.maxEnemies = Math.min(25, this.maxEnemies + 2);
    }
    
    update(deltaTime, playerPosition) {
        // Spawn logic is handled in main game loop
    }
}

// Base Enemy Class
class Enemy {
    constructor(position, type = 'basic') {
        this.mesh = ModelGenerator.createEnemyModel(type);
        this.mesh.position.copy(position);
        
        this.type = type;
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 10;
        this.speed = 5;
        this.attackRange = 3;
        this.attackCooldown = 1; // seconds
        this.lastAttackTime = 0;
        
        this.velocity = new THREE.Vector3();
        this.target = null;
        
        // AI state
        this.state = 'idle'; // idle, moving, attacking, dead
        this.stateTimer = 0;
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.setupHealthBar();
    }
    
    setupHealthBar() {
        // Create health bar above enemy
        const barGeometry = new THREE.PlaneGeometry(2, 0.2);
        const barMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        
        this.healthBar = new THREE.Mesh(barGeometry, barMaterial);
        this.healthBar.position.set(0, 3, 0);
        this.healthBar.lookAt(new THREE.Vector3(0, 3, 1));
        this.mesh.add(this.healthBar);
        
        // Health bar background
        const bgGeometry = new THREE.PlaneGeometry(2.1, 0.3);
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5
        });
        
        this.healthBarBg = new THREE.Mesh(bgGeometry, bgMaterial);
        this.healthBarBg.position.set(0, 3, -0.01);
        this.healthBarBg.lookAt(new THREE.Vector3(0, 3, 1));
        this.mesh.add(this.healthBarBg);
    }
    
    updateHealthBar() {
        if (this.healthBar) {
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.scale.x = healthPercent;
            
            // Change color based on health
            const hue = healthPercent * 0.3; // Red to green
            this.healthBar.material.color.setHSL(hue, 1, 0.5);
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health);
        this.updateHealthBar();
        
        // Damage effect
        this.createDamageEffect();
        
        if (this.health <= 0) {
            this.state = 'dead';
        }
    }
    
    createDamageEffect() {
        // Flash red
        const originalEmissive = this.mesh.children[0].material.emissive.clone();
        this.mesh.children[0].material.emissive.setHex(0xff0000);
        
        setTimeout(() => {
            if (this.mesh.children[0] && this.mesh.children[0].material) {
                this.mesh.children[0].material.emissive.copy(originalEmissive);
            }
        }, 100);
    }
    
    canAttack() {
        const currentTime = Date.now() / 1000;
        return (currentTime - this.lastAttackTime) >= this.attackCooldown;
    }
    
    attack() {
        this.lastAttackTime = Date.now() / 1000;
        this.state = 'attacking';
        this.stateTimer = 0.5; // Attack animation duration
        
        // Attack animation
        this.playAttackAnimation();
    }
    
    playAttackAnimation() {
        const originalScale = this.mesh.scale.clone();
        const animationDuration = 500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / animationDuration;
            
            if (progress < 1) {
                const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
                this.mesh.scale.setScalar(scale);
                requestAnimationFrame(animate);
            } else {
                this.mesh.scale.copy(originalScale);
            }
        };
        animate();
    }
    
    update(deltaTime, playerPosition) {
        if (this.state === 'dead') return;
        
        this.stateTimer -= deltaTime;
        
        // AI behavior
        this.updateAI(deltaTime, playerPosition);
        
        // Apply movement
        this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Keep on ground
        this.mesh.position.y = Math.max(1, this.mesh.position.y);
        
        // Face player
        this.mesh.lookAt(playerPosition);
        
        // Update health bar to face camera
        if (this.healthBar && window.game && window.game.camera) {
            this.healthBar.lookAt(window.game.camera.position);
            this.healthBarBg.lookAt(window.game.camera.position);
        }
        
        // Animation
        this.animate(deltaTime);
    }
    
    updateAI(deltaTime, playerPosition) {
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
        
        if (distanceToPlayer > this.attackRange) {
            this.state = 'moving';
            // Move towards player
            const direction = new THREE.Vector3()
                .subVectors(playerPosition, this.mesh.position)
                .normalize();
            
            this.velocity.copy(direction.multiplyScalar(this.speed));
        } else {
            this.state = 'attacking';
            this.velocity.multiplyScalar(0.1); // Slow down when attacking
        }
    }
    
    animate(deltaTime) {
        // Base floating animation
        const time = Date.now() * 0.001;
        this.mesh.position.y = 1 + Math.sin(time * 2 + this.mesh.position.x) * 0.3;
        
        // Rotation animation
        this.mesh.rotation.y += deltaTime * 0.5;
    }
}

// Basic Enemy
class BasicEnemy extends Enemy {
    constructor(position) {
        super(position, 'basic');
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 15;
        this.speed = 8;
        this.attackRange = 4;
        this.attackCooldown = 1.5;
    }
}

// Fast Enemy
class FastEnemy extends Enemy {
    constructor(position) {
        super(position, 'fast');
        this.health = 30;
        this.maxHealth = 30;
        this.damage = 10;
        this.speed = 15;
        this.attackRange = 2;
        this.attackCooldown = 0.8;
    }
    
    updateAI(deltaTime, playerPosition) {
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
        
        if (distanceToPlayer > this.attackRange) {
            this.state = 'moving';
            // Zigzag movement
            const direction = new THREE.Vector3()
                .subVectors(playerPosition, this.mesh.position)
                .normalize();
            
            const time = Date.now() * 0.001;
            const zigzag = new THREE.Vector3(
                Math.sin(time * 5) * 3,
                0,
                Math.cos(time * 3) * 2
            );
            
            direction.add(zigzag.normalize().multiplyScalar(0.3));
            this.velocity.copy(direction.normalize().multiplyScalar(this.speed));
        } else {
            this.state = 'attacking';
            this.velocity.multiplyScalar(0.1);
        }
    }
}

// Heavy Enemy
class HeavyEnemy extends Enemy {
    constructor(position) {
        super(position, 'heavy');
        this.health = 120;
        this.maxHealth = 120;
        this.damage = 25;
        this.speed = 4;
        this.attackRange = 5;
        this.attackCooldown = 2;
    }
    
    animate(deltaTime) {
        // Slower, more imposing movement
        const time = Date.now() * 0.001;
        this.mesh.position.y = 1 + Math.sin(time + this.mesh.position.x) * 0.1;
        
        // Slow rotation with armor plates
        this.mesh.rotation.y += deltaTime * 0.2;
        
        // Animate armor plates
        this.mesh.children.forEach((child, index) => {
            if (index > 0) { // Skip main body
                child.rotation.y += deltaTime * (1 + index * 0.5);
            }
        });
    }
}

// Boss Enemy
class BossEnemy extends Enemy {
    constructor(position) {
        super(position, 'boss');
        this.health = 300;
        this.maxHealth = 300;
        this.damage = 40;
        this.speed = 6;
        this.attackRange = 15;
        this.attackCooldown = 3;
        
        // Boss special abilities
        this.specialAttackTimer = 0;
        this.specialAttackInterval = 8;
        
        // Scale up the boss
        this.mesh.scale.setScalar(1.5);
    }
    
    update(deltaTime, playerPosition) {
        super.update(deltaTime, playerPosition);
        
        // Special attack timer
        this.specialAttackTimer += deltaTime;
        if (this.specialAttackTimer >= this.specialAttackInterval) {
            this.specialAttackTimer = 0;
            this.performSpecialAttack(playerPosition);
        }
    }
    
    performSpecialAttack(playerPosition) {
        // Create energy waves
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const waveDirection = new THREE.Vector3(
                Math.cos(angle),
                0,
                Math.sin(angle)
            );
            
            this.createEnergyWave(waveDirection);
        }
        
        if (window.game && window.game.audioManager) {
            window.game.audioManager.playBossAttackSound();
        }
    }
    
    createEnergyWave(direction) {
        const waveGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const waveMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            emissive: 0x441100,
            transparent: true,
            opacity: 0.8
        });
        
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        wave.position.copy(this.mesh.position);
        wave.userData = {
            direction: direction.clone(),
            speed: 20,
            damage: 30,
            lifetime: 3,
            age: 0
        };
        
        this.scene.add(wave);
        
        // Animate wave
        const animateWave = () => {
            wave.userData.age += 0.016;
            
            if (wave.userData.age >= wave.userData.lifetime) {
                this.scene.remove(wave);
                return;
            }
            
            // Move wave
            const movement = wave.userData.direction.clone()
                .multiplyScalar(wave.userData.speed * 0.016);
            wave.position.add(movement);
            
            // Scale and fade
            const progress = wave.userData.age / wave.userData.lifetime;
            wave.scale.setScalar(1 + progress * 2);
            wave.material.opacity = 0.8 * (1 - progress);
            
            // Check collision with player
            if (window.game && window.game.player) {
                const playerPos = window.game.player.mesh.position;
                if (wave.position.distanceTo(playerPos) < 2) {
                    window.game.takeDamage(wave.userData.damage);
                    this.scene.remove(wave);
                    return;
                }
            }
            
            requestAnimationFrame(animateWave);
        };
        animateWave();
    }
    
    animate(deltaTime) {
        super.animate(deltaTime);
        
        // Animate rotating rings
        this.mesh.children.forEach((child, index) => {
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.x += deltaTime * child.userData.rotationSpeed;
                child.rotation.y += deltaTime * child.userData.rotationSpeed * 0.7;
                child.rotation.z += deltaTime * child.userData.rotationSpeed * 0.5;
            }
        });
        
        // Pulsing glow effect
        const time = Date.now() * 0.001;
        this.mesh.children[0].material.emissive.setHSL(0.08, 1, 0.2 + Math.sin(time * 3) * 0.1);
    }
}

// Enemy Projectile
class EnemyProjectile {
    constructor(startPosition, targetPosition, damage = 20) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0x440000
            })
        );
        
        this.mesh.position.copy(startPosition);
        
        this.direction = new THREE.Vector3()
            .subVectors(targetPosition, startPosition)
            .normalize();
        
        this.speed = 25;
        this.damage = damage;
        this.lifetime = 4;
        this.age = 0;
        this.shouldRemove = false;
        
        // Add trail
        this.createTrail();
    }
    
    createTrail() {
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.6
        });
        
        this.trail = new THREE.Line(trailGeometry, trailMaterial);
        this.trailPositions = [this.mesh.position.clone()];
        this.mesh.add(this.trail);
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.age >= this.lifetime) {
            this.shouldRemove = true;
            return;
        }
        
        // Move projectile
        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.mesh.position.add(movement);
        
        // Update trail
        this.trailPositions.unshift(this.mesh.position.clone());
        if (this.trailPositions.length > 8) {
            this.trailPositions.pop();
        }
        
        // Update trail geometry
        const positions = new Float32Array(this.trailPositions.length * 3);
        for (let i = 0; i < this.trailPositions.length; i++) {
            positions[i * 3] = this.trailPositions[i].x;
            positions[i * 3 + 1] = this.trailPositions[i].y;
            positions[i * 3 + 2] = this.trailPositions[i].z;
        }
        this.trail.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Rotate projectile
        this.mesh.rotation.x += 8 * deltaTime;
        this.mesh.rotation.z += 6 * deltaTime;
        
        // Check collision with player
        if (window.game && window.game.player) {
            const playerPos = window.game.player.mesh.position;
            if (this.mesh.position.distanceTo(playerPos) < 1.5) {
                window.game.takeDamage(this.damage);
                this.shouldRemove = true;
                
                // Create impact effect
                this.createImpactEffect();
            }
        }
    }
    
    createImpactEffect() {
        const explosion = new Explosion(this.mesh.position.clone(), 0.5);
        if (window.game) {
            window.game.scene.add(explosion.mesh);
            window.game.explosions = window.game.explosions || [];
            window.game.explosions.push(explosion);
        }
    }
}