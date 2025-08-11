// Powerup System
class PowerupManager {
    constructor(scene) {
        this.scene = scene;
        this.powerupTypes = ['health', 'ammo', 'damage', 'speed'];
        this.spawnTimer = 0;
        this.spawnInterval = 15; // seconds
    }
    
    spawnPowerup(position, type = null) {
        if (!type) {
            type = this.powerupTypes[Math.floor(Math.random() * this.powerupTypes.length)];
        }
        
        const powerup = new Powerup(position, type);
        
        if (window.game) {
            window.game.powerups.push(powerup);
            this.scene.add(powerup.mesh);
        }
        
        return powerup;
    }
    
    spawnRandomPowerup(playerPosition) {
        // Spawn at random position near player
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        
        const spawnPosition = new THREE.Vector3(
            playerPosition.x + Math.cos(angle) * distance,
            2,
            playerPosition.z + Math.sin(angle) * distance
        );
        
        // Keep within bounds
        const maxBound = 85;
        spawnPosition.x = Math.max(-maxBound, Math.min(maxBound, spawnPosition.x));
        spawnPosition.z = Math.max(-maxBound, Math.min(maxBound, spawnPosition.z));
        
        this.spawnPowerup(spawnPosition);
    }
    
    update(deltaTime) {
        // Periodic powerup spawning
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            
            if (window.game && window.game.player) {
                this.spawnRandomPowerup(window.game.player.mesh.position);
            }
        }
    }
}

class Powerup {
    constructor(position, type) {
        this.type = type;
        this.mesh = ModelGenerator.createPowerupModel(type);
        this.mesh.position.copy(position);
        
        this.rotationSpeed = 2;
        this.bobSpeed = 3;
        this.bobHeight = 0.5;
        this.startY = this.mesh.position.y;
        
        this.lifetime = 30; // seconds
        this.age = 0;
        this.shouldRemove = false;
        
        // Effect properties
        this.pulseSpeed = 4;
        this.glowIntensity = 0.5;
        
        this.setupEffects();
        this.createSpawnEffect();
    }
    
    setupEffects() {
        // Add pulsing light
        let lightColor;
        switch (this.type) {
            case 'health': lightColor = 0x00ff00; break;
            case 'ammo': lightColor = 0xffff00; break;
            case 'damage': lightColor = 0xff0000; break;
            case 'speed': lightColor = 0x00ffff; break;
            default: lightColor = 0xffffff;
        }
        
        this.light = new THREE.PointLight(lightColor, 1, 15);
        this.light.position.copy(this.mesh.position);
        this.mesh.add(this.light);
        
        // Outer glow sphere
        const glowGeometry = new THREE.SphereGeometry(2, 16, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: lightColor,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        this.outerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.outerGlow);
    }
    
    createSpawnEffect() {
        // Expanding ring effect
        const ringGeometry = new THREE.RingGeometry(0.1, 3, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: this.light.color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(this.mesh.position);
        ring.rotation.x = -Math.PI / 2;
        this.scene.add(ring);
        
        // Animate ring expansion
        const startTime = Date.now();
        const animationDuration = 1000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / animationDuration;
            
            if (progress < 1) {
                ring.scale.setScalar(1 + progress * 3);
                ring.material.opacity = 0.8 * (1 - progress);
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(ring);
            }
        };
        animate();
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.age >= this.lifetime) {
            this.shouldRemove = true;
            return;
        }
        
        const time = Date.now() * 0.001;
        
        // Rotation
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;
        
        // Bob up and down
        this.mesh.position.y = this.startY + Math.sin(time * this.bobSpeed) * this.bobHeight;
        
        // Pulsing effects
        const pulse = Math.sin(time * this.pulseSpeed) * 0.5 + 0.5;
        
        // Pulse light intensity
        this.light.intensity = 0.5 + pulse * 0.5;
        
        // Pulse glow
        if (this.outerGlow) {
            this.outerGlow.material.opacity = 0.05 + pulse * 0.1;
            this.outerGlow.scale.setScalar(1 + pulse * 0.3);
        }
        
        // Rotate inner ring
        const ring = this.mesh.children.find(child => child.geometry.type === 'TorusGeometry');
        if (ring) {
            ring.rotation.z += deltaTime * 3;
        }
        
        // Animate particles
        const particles = this.mesh.children.find(child => child.type === 'Points');
        if (particles) {
            particles.rotation.y += deltaTime * 2;
            particles.rotation.x += deltaTime * 1.5;
        }
        
        // Fade warning when near expiration
        if (this.age > this.lifetime - 5) {
            const fadeProgress = (this.age - (this.lifetime - 5)) / 5;
            const opacity = 1 - fadeProgress * 0.5;
            
            this.mesh.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = opacity;
                }
            });
        }
    }
    
    collect() {
        // Collection effect
        this.createCollectionEffect();
        
        // Apply powerup effect
        this.applyEffect();
        
        this.shouldRemove = true;
    }
    
    createCollectionEffect() {
        // Burst of particles
        const particleCount = 30;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            positions[i * 3] = this.mesh.position.x;
            positions[i * 3 + 1] = this.mesh.position.y;
            positions[i * 3 + 2] = this.mesh.position.z;
            
            velocities.push(new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 2,
                Math.sin(angle) * speed
            ));
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: this.light.color,
            size: 0.1,
            transparent: true,
            opacity: 1
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        
        // Animate particle burst
        const startTime = Date.now();
        const animationDuration = 1000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / animationDuration;
            
            if (progress < 1) {
                const positions = particles.geometry.attributes.position.array;
                
                for (let i = 0; i < velocities.length; i++) {
                    positions[i * 3] += velocities[i].x * 0.016;
                    positions[i * 3 + 1] += velocities[i].y * 0.016;
                    positions[i * 3 + 2] += velocities[i].z * 0.016;
                    
                    // Apply gravity to particles
                    velocities[i].y -= 5 * 0.016;
                }
                
                particles.geometry.attributes.position.needsUpdate = true;
                particles.material.opacity = 1 - progress;
                
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(particles);
            }
        };
        animate();
    }
    
    applyEffect() {
        if (!window.game) return;
        
        switch (this.type) {
            case 'health':
                window.game.health = Math.min(window.game.maxHealth, window.game.health + 25);
                window.game.uiManager.updateHealthBar(window.game.health, window.game.maxHealth);
                this.showEffectText('+25 HP', 0x00ff00);
                break;
                
            case 'ammo':
                if (window.game.weaponManager) {
                    window.game.weaponManager.currentWeapon.ammo = window.game.weaponManager.currentWeapon.maxAmmo;
                    this.showEffectText('AMMO FULL', 0xffff00);
                }
                break;
                
            case 'damage':
                if (window.game.weaponManager) {
                    window.game.weaponManager.applyDamageBoost();
                    this.showEffectText('DAMAGE BOOST!', 0xff0000);
                }
                break;
                
            case 'speed':
                if (window.game.player) {
                    window.game.player.applySpeedBoost();
                    this.showEffectText('SPEED BOOST!', 0x00ffff);
                }
                break;
        }
        
        window.game.addScore(50);
    }
    
    showEffectText(text, color) {
        // Create floating text effect
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeText(text, 128, 40);
        context.fillText(text, 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.copy(this.mesh.position);
        sprite.position.y += 2;
        sprite.scale.set(4, 2, 1);
        this.scene.add(sprite);
        
        // Animate text
        const startTime = Date.now();
        const animationDuration = 2000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / animationDuration;
            
            if (progress < 1) {
                sprite.position.y += 0.02;
                sprite.material.opacity = 1 - progress;
                sprite.scale.multiplyScalar(1 + progress * 0.5);
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(sprite);
            }
        };
        animate();
    }
}

// Weapon Powerup (for switching weapons)
class WeaponPowerup {
    constructor(position, weaponType) {
        this.type = 'weapon';
        this.weaponType = weaponType;
        this.mesh = ModelGenerator.createWeaponModel(weaponType);
        this.mesh.position.copy(position);
        this.mesh.position.y += 1;
        
        this.rotationSpeed = 1;
        this.bobSpeed = 2;
        this.bobHeight = 0.3;
        this.startY = this.mesh.position.y;
        
        this.lifetime = 45; // seconds
        this.age = 0;
        this.shouldRemove = false;
        
        this.setupEffects();
    }
    
    setupEffects() {
        // Holographic effect
        const holoGeometry = new THREE.CylinderGeometry(2, 2, 0.1, 16);
        const holoMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });
        
        this.holo = new THREE.Mesh(holoGeometry, holoMaterial);
        this.holo.position.y = -0.5;
        this.mesh.add(this.holo);
        
        // Weapon info display
        this.createWeaponInfo();
    }
    
    createWeaponInfo() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = '#00ffff';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        
        let weaponName = '';
        switch (this.weaponType) {
            case 'rifle': weaponName = 'ASSAULT RIFLE'; break;
            case 'shotgun': weaponName = 'PLASMA SHOTGUN'; break;
            case 'plasma': weaponName = 'PLASMA CANNON'; break;
        }
        
        context.strokeText(weaponName, 128, 40);
        context.fillText(weaponName, 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        this.infoSprite = new THREE.Sprite(material);
        
        this.infoSprite.position.set(0, 3, 0);
        this.infoSprite.scale.set(4, 2, 1);
        this.mesh.add(this.infoSprite);
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.age >= this.lifetime) {
            this.shouldRemove = true;
            return;
        }
        
        const time = Date.now() * 0.001;
        
        // Rotation
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;
        
        // Bob up and down
        this.mesh.position.y = this.startY + Math.sin(time * this.bobSpeed) * this.bobHeight;
        
        // Hologram effects
        if (this.holo) {
            this.holo.rotation.y += deltaTime * 2;
            this.holo.material.opacity = 0.2 + Math.sin(time * 4) * 0.1;
        }
        
        // Info sprite always faces camera
        if (this.infoSprite && window.game && window.game.camera) {
            this.infoSprite.lookAt(window.game.camera.position);
        }
        
        // Fade warning when near expiration
        if (this.age > this.lifetime - 10) {
            const fadeProgress = (this.age - (this.lifetime - 10)) / 10;
            const opacity = 1 - fadeProgress * 0.7;
            
            this.mesh.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = opacity;
                }
            });
        }
    }
    
    collect() {
        // Switch weapon
        if (window.game && window.game.weaponManager) {
            window.game.weaponManager.switchWeapon(this.weaponType);
            this.showCollectionText();
        }
        
        this.shouldRemove = true;
    }
    
    showCollectionText() {
        let weaponName = '';
        switch (this.weaponType) {
            case 'rifle': weaponName = 'ASSAULT RIFLE'; break;
            case 'shotgun': weaponName = 'PLASMA SHOTGUN'; break;
            case 'plasma': weaponName = 'PLASMA CANNON'; break;
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 64;
        
        context.fillStyle = '#00ffff';
        context.font = 'bold 28px Arial';
        context.textAlign = 'center';
        context.strokeStyle = '#000000';
        context.lineWidth = 3;
        context.strokeText(`${weaponName} EQUIPPED!`, 256, 40);
        context.fillText(`${weaponName} EQUIPPED!`, 256, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.copy(this.mesh.position);
        sprite.position.y += 3;
        sprite.scale.set(8, 2, 1);
        this.scene.add(sprite);
        
        // Animate text
        const startTime = Date.now();
        const animationDuration = 2500;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / animationDuration;
            
            if (progress < 1) {
                sprite.position.y += 0.015;
                sprite.material.opacity = 1 - progress;
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(sprite);
            }
        };
        animate();
    }
}

// Special Effect Powerups
class ShieldPowerup extends Powerup {
    constructor(position) {
        super(position, 'shield');
        this.duration = 10000; // 10 seconds
    }
    
    applyEffect() {
        if (!window.game || !window.game.player) return;
        
        // Create shield effect around player
        const shieldGeometry = new THREE.SphereGeometry(2, 16, 12);
        const shieldMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.copy(window.game.player.mesh.position);
        window.game.scene.add(shield);
        
        // Store shield reference
        window.game.player.shield = shield;
        window.game.player.shieldTime = this.duration;
        
        // Animate shield
        const animate = () => {
            if (window.game.player.shieldTime > 0) {
                window.game.player.shieldTime -= 16; // ~60fps
                shield.position.copy(window.game.player.mesh.position);
                shield.rotation.y += 0.02;
                shield.rotation.x += 0.01;
                
                // Pulse effect
                const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.3;
                shield.material.opacity = pulse;
                
                requestAnimationFrame(animate);
            } else {
                window.game.scene.remove(shield);
                window.game.player.shield = null;
            }
        };
        animate();
        
        this.showEffectText('SHIELD ACTIVATED!', 0x00ffff);
    }
}

// Temporary invincibility powerup
class InvincibilityPowerup extends Powerup {
    constructor(position) {
        super(position, 'invincible');
        this.duration = 5000; // 5 seconds
        
        // Golden appearance
        this.mesh.children.forEach(child => {
            if (child.material) {
                child.material.color.setHex(0xffd700);
                child.material.emissive.setHex(0x443300);
            }
        });
    }
    
    applyEffect() {
        if (!window.game) return;
        
        window.game.invincibilityTime = this.duration;
        
        // Visual effect on player
        if (window.game.player && window.game.player.mesh) {
            const originalMaterials = [];
            window.game.player.mesh.children.forEach((child, index) => {
                if (child.material) {
                    originalMaterials[index] = child.material.clone();
                    child.material.emissive.setHex(0xffd700);
                    child.material.transparent = true;
                }
            });
            
            // Restore materials after effect
            setTimeout(() => {
                if (window.game.player && window.game.player.mesh) {
                    window.game.player.mesh.children.forEach((child, index) => {
                        if (originalMaterials[index]) {
                            child.material = originalMaterials[index];
                        }
                    });
                }
            }, this.duration);
        }
        
        this.showEffectText('INVINCIBLE!', 0xffd700);
    }
}