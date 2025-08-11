// Weapon System
class WeaponManager {
    constructor(scene) {
        this.scene = scene;
        this.weapons = {
            rifle: {
                name: 'Assault Rifle',
                damage: 25,
                fireRate: 0.1, // seconds between shots
                maxAmmo: 30,
                ammo: 30,
                reloadTime: 2,
                bulletSpeed: 50,
                bulletType: 'basic',
                spread: 0.02
            },
            shotgun: {
                name: 'Plasma Shotgun',
                damage: 15,
                fireRate: 0.8,
                maxAmmo: 8,
                ammo: 8,
                reloadTime: 3,
                bulletSpeed: 40,
                bulletType: 'shotgun',
                spread: 0.1,
                pellets: 5
            },
            plasma: {
                name: 'Plasma Cannon',
                damage: 50,
                fireRate: 0.5,
                maxAmmo: 12,
                ammo: 12,
                reloadTime: 2.5,
                bulletSpeed: 60,
                bulletType: 'plasma',
                spread: 0.01
            }
        };
        
        this.currentWeaponType = 'rifle';
        this.currentWeapon = this.weapons.rifle;
        this.lastShotTime = 0;
        this.isReloading = false;
        this.reloadStartTime = 0;
        
        // Damage boost
        this.damageBoostTime = 0;
        this.damageBoostMultiplier = 2;
        this.damageBoostDuration = 10000; // 10 seconds
        
        this.weaponMesh = null;
        this.muzzleFlash = null;
        
        this.createWeaponMesh();
    }
    
    createWeaponMesh() {
        if (this.weaponMesh) {
            this.scene.remove(this.weaponMesh);
        }
        
        this.weaponMesh = ModelGenerator.createWeaponModel(this.currentWeaponType);
        this.weaponMesh.position.set(0.3, -0.2, -0.5);
        this.weaponMesh.rotation.y = Math.PI;
        
        // Attach to camera
        if (window.game && window.game.camera) {
            window.game.camera.add(this.weaponMesh);
        }
    }
    
    canShoot() {
        const currentTime = Date.now() / 1000;
        return !this.isReloading && 
               this.currentWeapon.ammo > 0 && 
               (currentTime - this.lastShotTime) >= this.currentWeapon.fireRate;
    }
    
    shoot(position, direction) {
        if (!this.canShoot()) return null;
        
        this.currentWeapon.ammo--;
        this.lastShotTime = Date.now() / 1000;
        
        // Create muzzle flash
        this.createMuzzleFlash();
        
        // Create bullets based on weapon type
        const bullets = [];
        const pelletCount = this.currentWeapon.pellets || 1;
        
        for (let i = 0; i < pelletCount; i++) {
            const bullet = this.createBullet(position, direction, i);
            if (bullet) {
                bullets.push(bullet);
            }
        }
        
        // Auto-reload when empty
        if (this.currentWeapon.ammo <= 0) {
            this.reload();
        }
        
        // Return array for shotgun, single bullet for others
        return pelletCount > 1 ? bullets : (bullets.length > 0 ? bullets[0] : null);
    }
    
    createBullet(position, direction, pelletIndex = 0) {
        const bullet = new Bullet(
            position.clone(),
            direction.clone(),
            this.currentWeapon,
            pelletIndex
        );
        
        return bullet;
    }
    
    createMuzzleFlash() {
        if (this.muzzleFlash) {
            this.weaponMesh.remove(this.muzzleFlash);
        }
        
        this.muzzleFlash = ModelGenerator.createMuzzleFlash();
        this.muzzleFlash.position.set(1.2, 0, 0);
        this.weaponMesh.add(this.muzzleFlash);
        
        // Remove muzzle flash after short time
        setTimeout(() => {
            if (this.muzzleFlash && this.weaponMesh) {
                this.weaponMesh.remove(this.muzzleFlash);
                this.muzzleFlash = null;
            }
        }, 100);
    }
    
    reload() {
        if (this.isReloading || this.currentWeapon.ammo === this.currentWeapon.maxAmmo) return;
        
        this.isReloading = true;
        this.reloadStartTime = Date.now() / 1000;
        
        // Play reload animation
        this.playReloadAnimation();
        
        setTimeout(() => {
            this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
            this.isReloading = false;
            
            if (window.game && window.game.audioManager) {
                window.game.audioManager.playReloadSound();
            }
        }, this.currentWeapon.reloadTime * 1000);
    }
    
    playReloadAnimation() {
        if (!this.weaponMesh) return;
        
        const originalPosition = this.weaponMesh.position.clone();
        const animationDuration = this.currentWeapon.reloadTime * 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / animationDuration;
            
            if (progress < 1) {
                // Simple bob animation
                this.weaponMesh.position.y = originalPosition.y - Math.sin(progress * Math.PI * 4) * 0.1;
                this.weaponMesh.rotation.z = Math.sin(progress * Math.PI * 2) * 0.1;
                requestAnimationFrame(animate);
            } else {
                this.weaponMesh.position.copy(originalPosition);
                this.weaponMesh.rotation.z = 0;
            }
        };
        animate();
    }
    
    switchWeapon(weaponType) {
        if (this.weapons[weaponType] && weaponType !== this.currentWeaponType) {
            this.currentWeaponType = weaponType;
            this.currentWeapon = this.weapons[weaponType];
            this.createWeaponMesh();
            
            if (window.game && window.game.audioManager) {
                window.game.audioManager.playWeaponSwitchSound();
            }
        }
    }
    
    applyDamageBoost() {
        this.damageBoostTime = this.damageBoostDuration;
        
        // Visual effect on weapon
        this.createDamageBoostEffect();
    }
    
    createDamageBoostEffect() {
        if (!this.weaponMesh) return;
        
        // Add glowing effect to weapon
        const glowGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0.5, 0, 0);
        this.weaponMesh.add(glow);
        
        // Animate glow
        const animate = () => {
            glow.rotation.x += 0.1;
            glow.rotation.y += 0.15;
            glow.material.opacity = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
            
            if (this.damageBoostTime > 0) {
                requestAnimationFrame(animate);
            } else {
                this.weaponMesh.remove(glow);
            }
        };
        animate();
    }
    
    update(deltaTime) {
        // Update damage boost
        if (this.damageBoostTime > 0) {
            this.damageBoostTime -= deltaTime * 1000;
        }
        
        // Weapon sway animation
        if (this.weaponMesh && window.game && window.game.player) {
            const time = Date.now() * 0.001;
            const player = window.game.player;
            
            // Breathing/idle sway
            this.weaponMesh.rotation.x = Math.sin(time * 2) * 0.01;
            this.weaponMesh.rotation.y = Math.PI + Math.cos(time * 1.5) * 0.005;
            
            // Movement sway
            if (player.keys.forward || player.keys.backward || player.keys.left || player.keys.right) {
                this.weaponMesh.rotation.z = Math.sin(time * 8) * 0.02;
                this.weaponMesh.position.y = -0.2 + Math.sin(time * 8) * 0.01;
            }
        }
    }
    
    getCurrentDamage() {
        const baseDamage = this.currentWeapon.damage;
        return this.damageBoostTime > 0 ? baseDamage * this.damageBoostMultiplier : baseDamage;
    }
}

// Bullet Class
class Bullet {
    constructor(position, direction, weapon, pelletIndex = 0) {
        this.mesh = ModelGenerator.createBulletModel(weapon.bulletType);
        this.mesh.position.copy(position);
        
        // Add spread for shotgun pellets
        if (pelletIndex > 0) {
            const spreadAngle = (Math.random() - 0.5) * weapon.spread;
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle);
            direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * weapon.spread);
        }
        
        this.direction = direction.normalize();
        this.speed = weapon.bulletSpeed;
        this.damage = window.game.weaponManager.getCurrentDamage();
        this.lifetime = 5; // seconds
        this.age = 0;
        this.shouldRemove = false;
        
        // Add trail effect for certain bullets
        if (weapon.bulletType === 'plasma') {
            this.createTrail();
        }
    }
    
    createTrail() {
        // Create particle trail for plasma bullets
        this.trailGeometry = new THREE.BufferGeometry();
        this.trailPositions = [];
        this.maxTrailLength = 10;
        
        for (let i = 0; i < this.maxTrailLength; i++) {
            this.trailPositions.push(this.mesh.position.clone());
        }
        
        this.updateTrailGeometry();
        
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        
        this.trail = new THREE.Line(this.trailGeometry, trailMaterial);
        this.mesh.add(this.trail);
    }
    
    updateTrailGeometry() {
        if (!this.trailGeometry) return;
        
        const positions = new Float32Array(this.trailPositions.length * 3);
        for (let i = 0; i < this.trailPositions.length; i++) {
            positions[i * 3] = this.trailPositions[i].x;
            positions[i * 3 + 1] = this.trailPositions[i].y;
            positions[i * 3 + 2] = this.trailPositions[i].z;
        }
        
        this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.age >= this.lifetime) {
            this.shouldRemove = true;
            return;
        }
        
        // Move bullet
        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.mesh.position.add(movement);
        
        // Update trail
        if (this.trailPositions) {
            this.trailPositions.unshift(this.mesh.position.clone());
            if (this.trailPositions.length > this.maxTrailLength) {
                this.trailPositions.pop();
            }
            this.updateTrailGeometry();
        }
        
        // Rotate bullet for visual effect
        this.mesh.rotation.x += 5 * deltaTime;
        this.mesh.rotation.y += 3 * deltaTime;
        
        // Check if bullet is out of bounds
        const maxDistance = 200;
        if (this.mesh.position.length() > maxDistance) {
            this.shouldRemove = true;
        }
    }
}

// Weapon pickup system
class WeaponPickup {
    constructor(position, weaponType) {
        this.mesh = ModelGenerator.createWeaponModel(weaponType);
        this.mesh.position.copy(position);
        this.mesh.position.y += 1;
        
        this.weaponType = weaponType;
        this.rotationSpeed = 2;
        this.bobSpeed = 3;
        this.bobHeight = 0.3;
        this.startY = this.mesh.position.y;
        
        // Add glow effect
        this.createGlowEffect();
    }
    
    createGlowEffect() {
        const glowGeometry = new THREE.SphereGeometry(1.5, 16, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);
    }
    
    update(deltaTime) {
        // Rotate weapon
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;
        
        // Bob up and down
        const time = Date.now() * 0.001;
        this.mesh.position.y = this.startY + Math.sin(time * this.bobSpeed) * this.bobHeight;
        
        // Animate glow
        if (this.glow) {
            this.glow.material.opacity = 0.1 + Math.sin(time * 4) * 0.05;
        }
    }
}

// Explosion effects
class Explosion {
    constructor(position, scale = 1) {
        this.mesh = ModelGenerator.createExplosion(position, scale);
        this.scale = scale;
        this.age = 0;
        this.lifetime = 1; // seconds
        this.shouldRemove = false;
        
        // Add light effect
        this.light = new THREE.PointLight(0xff4400, 2, 20);
        this.light.position.copy(position);
        this.mesh.add(this.light);
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.age >= this.lifetime) {
            this.shouldRemove = true;
            return;
        }
        
        const progress = this.age / this.lifetime;
        
        // Expand explosion
        const scale = this.scale * (1 + progress * 2);
        this.mesh.scale.setScalar(scale);
        
        // Fade out
        this.mesh.children.forEach(child => {
            if (child.material) {
                child.material.opacity = 1 - progress;
            }
        });
        
        // Fade light
        this.light.intensity = 2 * (1 - progress);
    }
}