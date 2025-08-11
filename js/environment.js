// Environment System
class Environment {
    constructor(scene) {
        this.scene = scene;
        this.starfield = null;
        this.nebula = null;
        this.planet = null;
        this.atmosphereEffects = [];
        
        this.init();
    }
    
    init() {
        this.createStarfield();
        this.createNebula();
        this.createPlanet();
        this.createAtmosphere();
        this.createDistantPlanets();
        this.createSpaceDebris();
    }
    
    createStarfield() {
        this.starfield = ModelGenerator.createStarfield();
        this.scene.add(this.starfield);
        
        // Create multiple layers of stars for parallax effect
        for (let layer = 0; layer < 3; layer++) {
            const layerStars = this.createStarLayer(layer);
            this.scene.add(layerStars);
        }
    }
    
    createStarLayer(layer) {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 500 - layer * 100;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            // Random position in sphere
            const radius = 300 + layer * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.cos(phi);
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Star colors (blue, white, yellow, red)
            const starColor = new THREE.Color();
            const colorType = Math.random();
            if (colorType < 0.3) {
                starColor.setHSL(0.6, 0.8, 0.9); // Blue
            } else if (colorType < 0.6) {
                starColor.setHSL(0, 0, 1); // White
            } else if (colorType < 0.85) {
                starColor.setHSL(0.15, 0.8, 0.9); // Yellow
            } else {
                starColor.setHSL(0, 0.8, 0.7); // Red
            }
            
            colors[i * 3] = starColor.r;
            colors[i * 3 + 1] = starColor.g;
            colors[i * 3 + 2] = starColor.b;
            
            sizes[i] = 1 + Math.random() * (3 - layer);
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8 - layer * 0.2,
            sizeAttenuation: false
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.userData = { layer: layer, rotationSpeed: 0.001 * (layer + 1) };
        
        return stars;
    }
    
    createNebula() {
        this.nebula = ModelGenerator.createNebula();
        this.scene.add(this.nebula);
        
        // Add animated nebula clouds
        for (let i = 0; i < 8; i++) {
            const cloudGeometry = new THREE.SphereGeometry(30 + Math.random() * 20, 16, 12);
            const cloudMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(
                    0.5 + Math.random() * 0.3,
                    0.7,
                    0.4
                ),
                transparent: true,
                opacity: 0.05,
                side: THREE.DoubleSide
            });
            
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 600,
                (Math.random() - 0.5) * 300,
                (Math.random() - 0.5) * 600
            );
            
            cloud.userData = {
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                driftSpeed: (Math.random() - 0.5) * 0.5,
                pulseSpeed: 1 + Math.random() * 2
            };
            
            this.nebula.add(cloud);
        }
    }
    
    createPlanet() {
        this.planet = ModelGenerator.createPlanetSurface();
        this.scene.add(this.planet);
        
        // Add planet atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(102, 32, 24);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.atmosphere.position.y = -1;
        this.scene.add(this.atmosphere);
        
        // Create planet core glow
        const coreGeometry = new THREE.SphereGeometry(98, 32, 24);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide
        });
        
        this.core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.core.position.y = -2;
        this.scene.add(this.core);
    }
    
    createAtmosphere() {
        // Floating dust particles
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 200;
        const positions = new Float32Array(dustCount * 3);
        const velocities = [];
        
        for (let i = 0; i < dustCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 20 + 1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.1
            ));
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.5,
            transparent: true,
            opacity: 0.3
        });
        
        this.dust = new THREE.Points(dustGeometry, dustMaterial);
        this.dust.userData = { velocities: velocities };
        this.scene.add(this.dust);
    }
    
    createDistantPlanets() {
        // Add distant planets in the sky
        for (let i = 0; i < 3; i++) {
            const planetGeometry = new THREE.SphereGeometry(5 + Math.random() * 10, 16, 12);
            const planetMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
                transparent: true,
                opacity: 0.6
            });
            
            const distantPlanet = new THREE.Mesh(planetGeometry, planetMaterial);
            
            // Position far away
            const angle = (i / 3) * Math.PI * 2;
            const distance = 200 + Math.random() * 100;
            const height = 50 + Math.random() * 50;
            
            distantPlanet.position.set(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            distantPlanet.userData = {
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                orbitSpeed: (Math.random() - 0.5) * 0.01,
                orbitRadius: distance
            };
            
            this.scene.add(distantPlanet);
            this.atmosphereEffects.push(distantPlanet);
        }
    }
    
    createSpaceDebris() {
        // Add floating space debris
        for (let i = 0; i < 20; i++) {
            const debrisGeometry = new THREE.BoxGeometry(
                0.5 + Math.random() * 2,
                0.5 + Math.random() * 2,
                0.5 + Math.random() * 2
            );
            const debrisMaterial = new THREE.MeshPhongMaterial({
                color: 0x666666,
                shininess: 10
            });
            
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            debris.position.set(
                (Math.random() - 0.5) * 180,
                2 + Math.random() * 8,
                (Math.random() - 0.5) * 180
            );
            
            debris.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            debris.userData = {
                rotationSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ),
                floatSpeed: 0.5 + Math.random() * 1.5
            };
            
            debris.castShadow = true;
            debris.receiveShadow = true;
            
            this.scene.add(debris);
            this.atmosphereEffects.push(debris);
        }
    }
    
    createLightningEffect() {
        // Atmospheric lightning
        const lightningGeometry = new THREE.BufferGeometry();
        const points = [];
        
        // Generate random lightning path
        let currentPoint = new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            20 + Math.random() * 30,
            (Math.random() - 0.5) * 100
        );
        
        points.push(currentPoint.clone());
        
        for (let i = 0; i < 10; i++) {
            currentPoint.add(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                -2 - Math.random() * 3,
                (Math.random() - 0.5) * 10
            ));
            points.push(currentPoint.clone());
        }
        
        lightningGeometry.setFromPoints(points);
        
        const lightningMaterial = new THREE.LineBasicMaterial({
            color: 0x88aaff,
            transparent: true,
            opacity: 0.8
        });
        
        const lightning = new THREE.Line(lightningGeometry, lightningMaterial);
        this.scene.add(lightning);
        
        // Flash effect
        const flash = new THREE.PointLight(0x88aaff, 3, 100);
        flash.position.copy(points[0]);
        this.scene.add(flash);
        
        // Remove lightning after short time
        setTimeout(() => {
            this.scene.remove(lightning);
            this.scene.remove(flash);
        }, 200);
    }
    
    update(deltaTime) {
        this.updateStarfield(deltaTime);
        this.updateNebula(deltaTime);
        this.updateAtmosphere(deltaTime);
        this.updateDebris(deltaTime);
        this.updateDistantPlanets(deltaTime);
        
        // Random lightning
        if (Math.random() < 0.001) {
            this.createLightningEffect();
        }
    }
    
    updateStarfield(deltaTime) {
        // Slowly rotate starfield
        if (this.starfield) {
            this.starfield.rotation.y += deltaTime * 0.01;
            this.starfield.rotation.x += deltaTime * 0.005;
        }
        
        // Rotate star layers at different speeds
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.layer !== undefined) {
                child.rotation.y += deltaTime * child.userData.rotationSpeed;
            }
        });
    }
    
    updateNebula(deltaTime) {
        if (!this.nebula) return;
        
        // Animate nebula clouds
        this.nebula.children.forEach(cloud => {
            if (cloud.userData) {
                cloud.rotation.y += deltaTime * cloud.userData.rotationSpeed;
                cloud.rotation.x += deltaTime * cloud.userData.rotationSpeed * 0.5;
                
                // Drift movement
                cloud.position.x += Math.sin(Date.now() * 0.001 * cloud.userData.driftSpeed) * 0.01;
                cloud.position.z += Math.cos(Date.now() * 0.001 * cloud.userData.driftSpeed) * 0.01;
                
                // Pulsing opacity
                const time = Date.now() * 0.001;
                cloud.material.opacity = 0.05 + Math.sin(time * cloud.userData.pulseSpeed) * 0.02;
            }
        });
    }
    
    updateAtmosphere(deltaTime) {
        // Animate atmosphere glow
        if (this.atmosphere) {
            this.atmosphere.rotation.y += deltaTime * 0.1;
            
            const time = Date.now() * 0.001;
            this.atmosphere.material.opacity = 0.08 + Math.sin(time * 2) * 0.03;
        }
        
        if (this.core) {
            this.core.rotation.y -= deltaTime * 0.05;
            
            const time = Date.now() * 0.001;
            this.core.material.opacity = 0.03 + Math.sin(time * 3) * 0.02;
        }
        
        // Update floating dust
        if (this.dust && this.dust.userData.velocities) {
            const positions = this.dust.geometry.attributes.position.array;
            const velocities = this.dust.userData.velocities;
            
            for (let i = 0; i < velocities.length; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
                
                // Wrap around bounds
                if (Math.abs(positions[i * 3]) > 100) {
                    positions[i * 3] = -positions[i * 3] * 0.5;
                }
                if (positions[i * 3 + 1] > 25 || positions[i * 3 + 1] < 1) {
                    velocities[i].y = -velocities[i].y;
                }
                if (Math.abs(positions[i * 3 + 2]) > 100) {
                    positions[i * 3 + 2] = -positions[i * 3 + 2] * 0.5;
                }
            }
            
            this.dust.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    updateDebris(deltaTime) {
        this.atmosphereEffects.forEach(object => {
            if (object.userData && object.userData.rotationSpeed) {
                // Rotate debris
                object.rotation.x += deltaTime * object.userData.rotationSpeed.x;
                object.rotation.y += deltaTime * object.userData.rotationSpeed.y;
                object.rotation.z += deltaTime * object.userData.rotationSpeed.z;
                
                // Float up and down
                if (object.userData.floatSpeed) {
                    const time = Date.now() * 0.001;
                    object.position.y += Math.sin(time * object.userData.floatSpeed) * 0.01;
                }
            }
        });
    }
    
    updateDistantPlanets(deltaTime) {
        this.atmosphereEffects.forEach(planet => {
            if (planet.userData && planet.userData.orbitSpeed) {
                // Rotate planets
                planet.rotation.y += deltaTime * planet.userData.rotationSpeed;
                
                // Orbital movement
                const time = Date.now() * 0.001;
                const angle = time * planet.userData.orbitSpeed;
                const radius = planet.userData.orbitRadius;
                
                planet.position.x = Math.cos(angle) * radius;
                planet.position.z = Math.sin(angle) * radius;
                
                // Subtle size pulsing
                const pulse = 1 + Math.sin(time * 0.5) * 0.05;
                planet.scale.setScalar(pulse);
            }
        });
    }
    
    createMeteorShower() {
        // Periodic meteor shower
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createMeteor();
            }, i * 500);
        }
    }
    
    createMeteor() {
        const meteorGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 1, 8, 8);
        const meteorMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            emissive: 0x441100
        });
        
        const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
        
        // Start from high up and random position
        meteor.position.set(
            (Math.random() - 0.5) * 200,
            50 + Math.random() * 20,
            (Math.random() - 0.5) * 200
        );
        
        const targetPosition = new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            0,
            (Math.random() - 0.5) * 100
        );
        
        const direction = new THREE.Vector3()
            .subVectors(targetPosition, meteor.position)
            .normalize();
        
        meteor.userData = {
            direction: direction,
            speed: 30 + Math.random() * 20,
            lifetime: 3,
            age: 0
        };
        
        // Add trail
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.8
        });
        
        meteor.trail = new THREE.Line(trailGeometry, trailMaterial);
        meteor.trailPositions = [meteor.position.clone()];
        
        this.scene.add(meteor);
        this.scene.add(meteor.trail);
        
        // Animate meteor
        const animate = () => {
            meteor.userData.age += 0.016;
            
            if (meteor.userData.age >= meteor.userData.lifetime) {
                this.scene.remove(meteor);
                this.scene.remove(meteor.trail);
                return;
            }
            
            // Move meteor
            const movement = meteor.userData.direction.clone()
                .multiplyScalar(meteor.userData.speed * 0.016);
            meteor.position.add(movement);
            
            // Update trail
            meteor.trailPositions.unshift(meteor.position.clone());
            if (meteor.trailPositions.length > 10) {
                meteor.trailPositions.pop();
            }
            
            // Update trail geometry
            const positions = new Float32Array(meteor.trailPositions.length * 3);
            for (let i = 0; i < meteor.trailPositions.length; i++) {
                positions[i * 3] = meteor.trailPositions[i].x;
                positions[i * 3 + 1] = meteor.trailPositions[i].y;
                positions[i * 3 + 2] = meteor.trailPositions[i].z;
            }
            meteor.trail.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            // Rotate meteor
            meteor.rotation.x += 0.1;
            meteor.rotation.y += 0.08;
            
            // Check if hit ground
            if (meteor.position.y <= 1) {
                // Create impact explosion
                const explosion = new Explosion(meteor.position.clone(), 2);
                this.scene.add(explosion.mesh);
                
                // Add to game explosions if game exists
                if (window.game) {
                    window.game.explosions = window.game.explosions || [];
                    window.game.explosions.push(explosion);
                }
                
                this.scene.remove(meteor);
                this.scene.remove(meteor.trail);
                return;
            }
            
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    createAuroraEffect() {
        // Create aurora-like effect in the sky
        const auroraGeometry = new THREE.PlaneGeometry(100, 30, 20, 5);
        const auroraVertices = auroraGeometry.attributes.position.array;
        
        // Create wave pattern
        for (let i = 0; i < auroraVertices.length; i += 3) {
            const x = auroraVertices[i];
            auroraVertices[i + 1] += Math.sin(x * 0.1) * 2;
        }
        
        const auroraMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        const aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
        aurora.position.set(0, 25, -50);
        aurora.rotation.x = Math.PI / 6;
        
        aurora.userData = {
            waveSpeed: 2,
            colorShift: 0
        };
        
        this.scene.add(aurora);
        this.atmosphereEffects.push(aurora);
        
        // Animate aurora
        const animateAurora = () => {
            const time = Date.now() * 0.001;
            
            // Wave animation
            const vertices = aurora.geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                vertices[i + 1] = Math.sin(x * 0.1 + time * aurora.userData.waveSpeed) * 2;
            }
            aurora.geometry.attributes.position.needsUpdate = true;
            
            // Color shifting
            aurora.userData.colorShift += deltaTime;
            const hue = (aurora.userData.colorShift * 0.1) % 1;
            aurora.material.color.setHSL(hue, 0.8, 0.6);
            
            requestAnimationFrame(animateAurora);
        };
        animateAurora();
    }
    
    // Periodic environmental events
    triggerRandomEvent() {
        const events = [
            () => this.createMeteorShower(),
            () => this.createAuroraEffect(),
            () => this.createLightningEffect()
        ];
        
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent();
    }
}