// 3D Models Generator
class ModelGenerator {
    static createPlayerModel() {
        const group = new THREE.Group();
        
        // Body (cylinder shape for compatibility)
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a5298,
            shininess: 100,
            specular: 0x111111
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        group.add(body);
        
        // Helmet
        const helmetGeometry = new THREE.SphereGeometry(0.4, 16, 12);
        const helmetMaterial = new THREE.MeshPhongMaterial({
            color: 0x1e3c72,
            transparent: true,
            opacity: 0.8,
            shininess: 200
        });
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 1.8;
        helmet.castShadow = true;
        group.add(helmet);
        
        // Visor
        const visorGeometry = new THREE.RingGeometry(0.15, 0.25, 8);
        const visorMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.7
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 1.8, 0.35);
        visor.rotation.x = -Math.PI / 2;
        group.add(visor);
        
        // Jetpack
        const jetpackGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.3);
        const jetpackMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            shininess: 50
        });
        const jetpack = new THREE.Mesh(jetpackGeometry, jetpackMaterial);
        jetpack.position.set(0, 1.2, -0.4);
        jetpack.castShadow = true;
        group.add(jetpack);
        
        return group;
    }
    
    static createEnemyModel(type = 'basic') {
        const group = new THREE.Group();
        
        switch (type) {
            case 'basic':
                return this.createBasicEnemy();
            case 'fast':
                return this.createFastEnemy();
            case 'heavy':
                return this.createHeavyEnemy();
            case 'boss':
                return this.createBossEnemy();
            default:
                return this.createBasicEnemy();
        }
    }
    
    static createBasicEnemy() {
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.OctahedronGeometry(1, 1);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444,
            shininess: 100,
            emissive: 0x220000
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 0.2, 0.8);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 0.2, 0.8);
        group.add(rightEye);
        
        // Spikes
        for (let i = 0; i < 6; i++) {
            const spikeGeometry = new THREE.ConeGeometry(0.1, 0.5, 6);
            const spikeMaterial = new THREE.MeshPhongMaterial({ color: 0x990000 });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            spike.position.set(
                Math.cos(angle) * 1.2,
                0,
                Math.sin(angle) * 1.2
            );
            spike.lookAt(new THREE.Vector3(0, 0, 0));
            spike.castShadow = true;
            group.add(spike);
        }
        
        return group;
    }
    
    static createFastEnemy() {
        const group = new THREE.Group();
        
        // Sleek body
        const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x44ff44,
            shininess: 150,
            emissive: 0x002200
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        body.castShadow = true;
        group.add(body);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.castShadow = true;
        group.add(wings);
        
        return group;
    }
    
    static createHeavyEnemy() {
        const group = new THREE.Group();
        
        // Large cubic body
        const bodyGeometry = new THREE.BoxGeometry(2, 2, 2);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x8844ff,
            shininess: 80,
            emissive: 0x110022
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // Armor plates
        for (let i = 0; i < 4; i++) {
            const plateGeometry = new THREE.BoxGeometry(0.3, 2.2, 0.3);
            const plateMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const plate = new THREE.Mesh(plateGeometry, plateMaterial);
            
            const angle = (i / 4) * Math.PI * 2;
            plate.position.set(
                Math.cos(angle) * 1.2,
                0,
                Math.sin(angle) * 1.2
            );
            plate.castShadow = true;
            group.add(plate);
        }
        
        return group;
    }
    
    static createBossEnemy() {
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.SphereGeometry(3, 16, 12);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xff8800,
            shininess: 200,
            emissive: 0x331100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // Rotating rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(4 + i, 0.2, 8, 16);
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: 0xffaa00,
                emissive: 0x441100
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;
            ring.userData = { rotationSpeed: 0.5 + Math.random() };
            group.add(ring);
        }
        
        return group;
    }
    
    static createWeaponModel(type = 'rifle') {
        const group = new THREE.Group();
        
        switch (type) {
            case 'rifle':
                return this.createRifleModel();
            case 'shotgun':
                return this.createShotgunModel();
            case 'plasma':
                return this.createPlasmaModel();
            default:
                return this.createRifleModel();
        }
    }
    
    static createRifleModel() {
        const group = new THREE.Group();
        
        // Barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.75, 0, 0);
        group.add(barrel);
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.2);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Stock
        const stockGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.15);
        const stockMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
        const stock = new THREE.Mesh(stockGeometry, stockMaterial);
        stock.position.set(-0.5, -0.1, 0);
        group.add(stock);
        
        return group;
    }
    
    static createShotgunModel() {
        const group = new THREE.Group();
        
        // Wider barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.6, 0, 0);
        group.add(barrel);
        
        // Pump
        const pumpGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.25);
        const pumpMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        const pump = new THREE.Mesh(pumpGeometry, pumpMaterial);
        group.add(pump);
        
        return group;
    }
    
    static createPlasmaModel() {
        const group = new THREE.Group();
        
        // Futuristic barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.06, 0.1, 1.3, 6);
        const barrelMaterial = new THREE.MeshPhongMaterial({
            color: 0x0088ff,
            emissive: 0x001144
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.65, 0, 0);
        group.add(barrel);
        
        // Energy core
        const coreGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.set(-0.2, 0, 0);
        group.add(core);
        
        return group;
    }
    
    static createBulletModel(type = 'basic') {
        switch (type) {
            case 'basic':
                const geometry = new THREE.SphereGeometry(0.05, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xffff00,
                    emissive: 0x444400
                });
                return new THREE.Mesh(geometry, material);
                
            case 'plasma':
                const plasmaGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const plasmaMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ffff,
                    emissive: 0x004444,
                    transparent: true,
                    opacity: 0.8
                });
                return new THREE.Mesh(plasmaGeometry, plasmaMaterial);
                
            case 'shotgun':
                const pelletGeometry = new THREE.SphereGeometry(0.03, 6, 6);
                const pelletMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff8800,
                    emissive: 0x442200
                });
                return new THREE.Mesh(pelletGeometry, pelletMaterial);
                
            default:
                return this.createBulletModel('basic');
        }
    }
    
    static createPowerupModel(type) {
        const group = new THREE.Group();
        
        // Base crystal shape
        const crystalGeometry = new THREE.OctahedronGeometry(0.5, 1);
        let crystalMaterial;
        
        switch (type) {
            case 'health':
                crystalMaterial = new THREE.MeshPhongMaterial({
                    color: 0x00ff00,
                    emissive: 0x002200,
                    transparent: true,
                    opacity: 0.8
                });
                break;
            case 'ammo':
                crystalMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffff00,
                    emissive: 0x444400,
                    transparent: true,
                    opacity: 0.8
                });
                break;
            case 'damage':
                crystalMaterial = new THREE.MeshPhongMaterial({
                    color: 0xff0000,
                    emissive: 0x440000,
                    transparent: true,
                    opacity: 0.8
                });
                break;
            case 'speed':
                crystalMaterial = new THREE.MeshPhongMaterial({
                    color: 0x00ffff,
                    emissive: 0x004444,
                    transparent: true,
                    opacity: 0.8
                });
                break;
            default:
                crystalMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    emissive: 0x222222,
                    transparent: true,
                    opacity: 0.8
                });
        }
        
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.castShadow = true;
        group.add(crystal);
        
        // Rotating ring around crystal
        const ringGeometry = new THREE.TorusGeometry(0.8, 0.05, 8, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: crystalMaterial.color,
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        // Floating particles
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 4;
            positions[i + 1] = (Math.random() - 0.5) * 4;
            positions[i + 2] = (Math.random() - 0.5) * 4;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: crystalMaterial.color,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        group.add(particles);
        
        return group;
    }
    
    static createPlanetSurface() {
        const group = new THREE.Group();
        
        // Main planet surface
        const surfaceGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        
        // Generate height map for terrain
        const vertices = surfaceGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 + 
                             Math.random() * 0.5;
        }
        surfaceGeometry.attributes.position.needsUpdate = true;
        surfaceGeometry.computeVertexNormals();
        
        const surfaceMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            shininess: 30,
            bumpScale: 0.5
        });
        
        const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        surface.rotation.x = -Math.PI / 2;
        surface.receiveShadow = true;
        group.add(surface);
        
        // Rocks and debris
        for (let i = 0; i < 50; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(
                0.5 + Math.random() * 1.5,
                Math.floor(Math.random() * 2)
            );
            const rockMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(0.1, 0.3, 0.2 + Math.random() * 0.3)
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            rock.position.set(
                (Math.random() - 0.5) * 180,
                Math.random() * 2,
                (Math.random() - 0.5) * 180
            );
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            group.add(rock);
        }
        
        return group;
    }
    
    static createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            // Random position in sphere
            const radius = 400 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.cos(phi);
            positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Random star colors
            const starColor = new THREE.Color();
            starColor.setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.8);
            colors[i] = starColor.r;
            colors[i + 1] = starColor.g;
            colors[i + 2] = starColor.b;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        return new THREE.Points(starGeometry, starMaterial);
    }
    
    static createNebula() {
        const group = new THREE.Group();
        
        for (let i = 0; i < 5; i++) {
            const nebulaGeometry = new THREE.SphereGeometry(50 + Math.random() * 30, 16, 12);
            const nebulaMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(
                    Math.random() * 0.8 + 0.1,
                    0.6,
                    0.3
                ),
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            
            const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
            nebula.position.set(
                (Math.random() - 0.5) * 400,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 400
            );
            
            group.add(nebula);
        }
        
        return group;
    }
    
    static createExplosion(position, scale = 1) {
        const group = new THREE.Group();
        
        // Multiple explosion spheres
        for (let i = 0; i < 5; i++) {
            const explosionGeometry = new THREE.SphereGeometry(0.5 * scale, 8, 8);
            const explosionMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.1 - i * 0.02, 1, 0.8 - i * 0.1),
                transparent: true,
                opacity: 0.8 - i * 0.15
            });
            
            const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
            explosion.position.copy(position);
            explosion.scale.setScalar(1 + i * 0.3);
            group.add(explosion);
        }
        
        group.position.copy(position);
        return group;
    }
    
    static createMuzzleFlash() {
        const group = new THREE.Group();
        
        // Flash cone
        const flashGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.rotation.z = -Math.PI / 2;
        group.add(flash);
        
        // Spark particles
        const sparkGeometry = new THREE.BufferGeometry();
        const sparkCount = 10;
        const positions = new Float32Array(sparkCount * 3);
        
        for (let i = 0; i < sparkCount * 3; i += 3) {
            positions[i] = Math.random() * 0.5;
            positions[i + 1] = (Math.random() - 0.5) * 0.3;
            positions[i + 2] = (Math.random() - 0.5) * 0.3;
        }
        
        sparkGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const sparkMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.9
        });
        
        const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
        group.add(sparks);
        
        return group;
    }
}