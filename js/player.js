// Player Controller
class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = null;
        this.controls = null;
        
        // Movement properties
        this.velocity = new THREE.Vector3();
        this.speed = 10;
        this.baseSpeed = 10;
        this.runSpeed = 15;
        this.jumpPower = 15;
        this.isOnGround = true;
        this.isRunning = false;
        
        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            run: false
        };
        
        // Boost effects
        this.speedBoostTime = 0;
        this.speedBoostDuration = 5000; // 5 seconds
        
        this.init();
    }
    
    init() {
        this.createPlayerMesh();
        this.setupControls();
        this.setupEventListeners();
    }
    
    createPlayerMesh() {
        this.mesh = ModelGenerator.createPlayerModel();
        this.mesh.position.set(0, 2, 0);
        this.scene.add(this.mesh);
        
        // Create invisible collision box
        const collisionGeometry = new THREE.BoxGeometry(1, 2, 1);
        const collisionMaterial = new THREE.MeshBasicMaterial({
            visible: false
        });
        this.collisionBox = new THREE.Mesh(collisionGeometry, collisionMaterial);
        this.collisionBox.position.copy(this.mesh.position);
        this.scene.add(this.collisionBox);
    }
    
    setupControls() {
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.getObject());
        
        // Position camera relative to player
        this.controls.getObject().position.copy(this.mesh.position);
        this.controls.getObject().position.y += 1.7; // Eye level
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        document.addEventListener('mousedown', (event) => this.onMouseDown(event));
    }
    
    onKeyDown(event) {
        if (!window.game || !window.game.isPlaying || window.game.isPaused) return;
        
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                event.preventDefault();
                this.keys.jump = true;
                break;
            case 'ShiftLeft':
                this.keys.run = true;
                break;
            case 'KeyR':
                if (window.game.weaponManager) {
                    window.game.weaponManager.reload();
                }
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'ShiftLeft':
                this.keys.run = false;
                break;
        }
    }
    
    onMouseDown(event) {
        if (!window.game || !window.game.isPlaying || window.game.isPaused) return;
        
        if (event.button === 0) { // Left click
            window.game.shoot();
        }
    }
    
    update(deltaTime) {
        if (!this.controls.enabled) return;
        
        this.updateMovement(deltaTime);
        this.updateBoosts(deltaTime);
        this.updatePosition();
        this.updateJetpackEffects();
    }
    
    updateMovement(deltaTime) {
        const direction = new THREE.Vector3();
        
        // Get movement direction relative to camera
        if (this.keys.forward) direction.z -= 1;
        if (this.keys.backward) direction.z += 1;
        if (this.keys.left) direction.x -= 1;
        if (this.keys.right) direction.x += 1;
        
        // Normalize direction
        direction.normalize();
        
        // Apply camera rotation to movement direction
        direction.applyQuaternion(this.camera.quaternion);
        direction.y = 0; // Don't move up/down with camera look
        direction.normalize();
        
        // Calculate speed
        this.isRunning = this.keys.run;
        const currentSpeed = this.isRunning ? this.runSpeed : this.speed;
        
        // Apply movement
        this.velocity.x = direction.x * currentSpeed;
        this.velocity.z = direction.z * currentSpeed;
        
        // Jumping
        if (this.keys.jump && this.isOnGround) {
            this.velocity.y = this.jumpPower;
            this.isOnGround = false;
        }
        
        // Gravity
        if (!this.isOnGround) {
            this.velocity.y -= 30 * deltaTime; // Gravity
        }
        
        // Ground collision
        if (this.mesh.position.y <= 1 && this.velocity.y <= 0) {
            this.mesh.position.y = 1;
            this.velocity.y = 0;
            this.isOnGround = true;
        }
    }
    
    updateBoosts(deltaTime) {
        // Speed boost countdown
        if (this.speedBoostTime > 0) {
            this.speedBoostTime -= deltaTime * 1000;
            if (this.speedBoostTime <= 0) {
                this.speed = this.baseSpeed;
                this.runSpeed = this.baseSpeed * 1.5;
            }
        }
    }
    
    updatePosition() {
        // Apply velocity to position
        this.mesh.position.add(this.velocity.clone().multiplyScalar(0.016)); // ~60fps
        
        // Keep player on planet surface (within bounds)
        const maxDistance = 95;
        if (this.mesh.position.x > maxDistance) this.mesh.position.x = maxDistance;
        if (this.mesh.position.x < -maxDistance) this.mesh.position.x = -maxDistance;
        if (this.mesh.position.z > maxDistance) this.mesh.position.z = maxDistance;
        if (this.mesh.position.z < -maxDistance) this.mesh.position.z = -maxDistance;
        
        // Update camera position to follow player
        this.controls.getObject().position.x = this.mesh.position.x;
        this.controls.getObject().position.z = this.mesh.position.z;
        this.controls.getObject().position.y = this.mesh.position.y + 1.7;
        
        // Update collision box
        this.collisionBox.position.copy(this.mesh.position);
        
        // Friction
        this.velocity.x *= 0.9;
        this.velocity.z *= 0.9;
    }
    
    updateJetpackEffects() {
        // Add jetpack particle effects when running or jumping
        if (this.isRunning || !this.isOnGround) {
            this.createJetpackParticles();
        }
    }
    
    createJetpackParticles() {
        // Create particle effect from jetpack
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 5;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = this.mesh.position.x + (Math.random() - 0.5) * 0.3;
            positions[i + 1] = this.mesh.position.y + 0.5 + Math.random() * 0.5;
            positions[i + 2] = this.mesh.position.z - 0.5 + (Math.random() - 0.5) * 0.3;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00aaff,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        
        // Remove particles after short time
        setTimeout(() => {
            this.scene.remove(particles);
        }, 200);
    }
    
    applySpeedBoost() {
        this.speedBoostTime = this.speedBoostDuration;
        this.speed = this.baseSpeed * 1.5;
        this.runSpeed = this.baseSpeed * 2.2;
        
        // Visual effect
        this.createSpeedBoostEffect();
    }
    
    createSpeedBoostEffect() {
        // Create speed lines effect
        const lineGeometry = new THREE.BufferGeometry();
        const lineCount = 20;
        const positions = new Float32Array(lineCount * 6); // 2 points per line
        
        for (let i = 0; i < lineCount * 6; i += 6) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 3;
            
            positions[i] = Math.cos(angle) * radius;
            positions[i + 1] = Math.random() * 4 - 2;
            positions[i + 2] = Math.sin(angle) * radius;
            
            positions[i + 3] = Math.cos(angle) * (radius + 1);
            positions[i + 4] = positions[i + 1];
            positions[i + 5] = Math.sin(angle) * (radius + 1);
        }
        
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5
        });
        
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        lines.position.copy(this.mesh.position);
        this.scene.add(lines);
        
        // Animate and remove
        const animate = () => {
            lines.rotation.y += 0.1;
            lines.material.opacity -= 0.02;
            
            if (lines.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(lines);
            }
        };
        animate();
    }
    
    takeDamage(amount) {
        // Screen shake effect
        this.createScreenShake();
        
        // Damage indicator
        this.createDamageIndicator(amount);
    }
    
    createScreenShake() {
        const originalPosition = this.camera.position.clone();
        const shakeIntensity = 0.1;
        const shakeDuration = 200;
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < shakeDuration) {
                this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * shakeIntensity;
                this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * shakeIntensity;
                this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * shakeIntensity;
                requestAnimationFrame(shake);
            } else {
                this.camera.position.copy(originalPosition);
            }
        };
        shake();
    }
    
    createDamageIndicator(amount) {
        // Create floating damage text (simplified version)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        
        context.fillStyle = '#ff0000';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(`-${amount}`, 64, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.copy(this.mesh.position);
        sprite.position.y += 3;
        sprite.scale.set(2, 1, 1);
        this.scene.add(sprite);
        
        // Animate damage indicator
        const startY = sprite.position.y;
        const animate = () => {
            sprite.position.y += 0.05;
            sprite.material.opacity -= 0.03;
            
            if (sprite.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(sprite);
            }
        };
        animate();
    }
    
    reset() {
        this.mesh.position.set(0, 2, 0);
        this.velocity.set(0, 0, 0);
        this.isOnGround = true;
        this.speedBoostTime = 0;
        this.speed = this.baseSpeed;
        this.runSpeed = this.baseSpeed * 1.5;
        
        // Reset camera
        this.controls.getObject().position.set(0, 3.7, 0);
        this.camera.rotation.set(0, 0, 0);
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    getForwardDirection() {
        return this.camera.getWorldDirection(new THREE.Vector3());
    }
}