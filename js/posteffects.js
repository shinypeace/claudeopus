// Post-processing effects
class PostEffects {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        this.effects = {
            bloom: true,
            filmGrain: true,
            vignette: true,
            chromaticAberration: false
        };
        
        this.setupPostProcessing();
    }
    
    setupPostProcessing() {
        // Create render targets
        this.renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                stencilBuffer: false
            }
        );
        
        // Create post-processing scene
        this.postScene = new THREE.Scene();
        this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        // Create post-processing material
        this.postMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                vignetteStrength: { value: 0.3 },
                filmGrainStrength: { value: 0.1 },
                bloomStrength: { value: 0.8 }
            },
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader()
        });
        
        // Create full-screen quad
        const postGeometry = new THREE.PlaneGeometry(2, 2);
        this.postQuad = new THREE.Mesh(postGeometry, this.postMaterial);
        this.postScene.add(this.postQuad);
    }
    
    getVertexShader() {
        return `
            varying vec2 vUv;
            
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }
    
    getFragmentShader() {
        return `
            uniform sampler2D tDiffuse;
            uniform float time;
            uniform vec2 resolution;
            uniform float vignetteStrength;
            uniform float filmGrainStrength;
            uniform float bloomStrength;
            
            varying vec2 vUv;
            
            // Noise function
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            // Vignette effect
            vec3 vignette(vec3 color, vec2 uv) {
                float dist = distance(uv, vec2(0.5));
                float vignette = 1.0 - smoothstep(0.3, 0.8, dist);
                return color * (1.0 - vignetteStrength * (1.0 - vignette));
            }
            
            // Film grain
            vec3 filmGrain(vec3 color, vec2 uv) {
                float noise = random(uv + time * 0.1) - 0.5;
                return color + noise * filmGrainStrength;
            }
            
            // Simple bloom
            vec3 bloom(sampler2D tex, vec2 uv) {
                vec3 color = texture2D(tex, uv).rgb;
                vec3 bloom = vec3(0.0);
                
                float samples = 9.0;
                float radius = 0.003;
                
                for(float i = 0.0; i < samples; i++) {
                    float angle = i * 2.0 * 3.14159 / samples;
                    vec2 offset = vec2(cos(angle), sin(angle)) * radius;
                    bloom += texture2D(tex, uv + offset).rgb;
                }
                
                bloom /= samples;
                return color + bloom * bloomStrength * 0.5;
            }
            
            void main() {
                vec3 color = bloom(tDiffuse, vUv);
                
                // Apply effects
                color = vignette(color, vUv);
                color = filmGrain(color, vUv);
                
                // Color grading for space atmosphere
                color = pow(color, vec3(0.9)); // Slight gamma correction
                color = mix(color, color * vec3(0.8, 0.9, 1.2), 0.1); // Cool tint
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }
    
    render(deltaTime) {
        // Update uniforms
        this.postMaterial.uniforms.time.value += deltaTime;
        
        // Render scene to texture
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);
        
        // Render post-processed result to screen
        this.postMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.postScene, this.postCamera);
    }
    
    onResize() {
        this.renderTarget.setSize(window.innerWidth, window.innerHeight);
        this.postMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }
    
    setVignetteStrength(strength) {
        this.postMaterial.uniforms.vignetteStrength.value = strength;
    }
    
    setFilmGrainStrength(strength) {
        this.postMaterial.uniforms.filmGrainStrength.value = strength;
    }
    
    setBloomStrength(strength) {
        this.postMaterial.uniforms.bloomStrength.value = strength;
    }
}

// Particle system for enhanced effects
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.systems = [];
    }
    
    createMuzzleFlashParticles(position, direction) {
        const particleCount = 15;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Start at muzzle position
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;
            
            // Random velocity in forward cone
            const spread = 0.3;
            const velocity = direction.clone();
            velocity.x += (Math.random() - 0.5) * spread;
            velocity.y += (Math.random() - 0.5) * spread;
            velocity.z += (Math.random() - 0.5) * spread;
            velocity.multiplyScalar(5 + Math.random() * 10);
            
            velocities.push(velocity);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Animate particles
        const startTime = Date.now();
        const lifetime = 300;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / lifetime;
            
            if (progress < 1) {
                const positions = particles.geometry.attributes.position.array;
                
                for (let i = 0; i < velocities.length; i++) {
                    positions[i * 3] += velocities[i].x * 0.016;
                    positions[i * 3 + 1] += velocities[i].y * 0.016;
                    positions[i * 3 + 2] += velocities[i].z * 0.016;
                    
                    // Apply gravity and drag
                    velocities[i].multiplyScalar(0.98);
                    velocities[i].y -= 5 * 0.016;
                }
                
                particles.geometry.attributes.position.needsUpdate = true;
                particles.material.opacity = 0.8 * (1 - progress);
                
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(particles);
            }
        };
        animate();
    }
    
    createBloodSplatter(position, direction) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            );
            
            velocities.push(velocity);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xff2200,
            size: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Animate blood particles
        const startTime = Date.now();
        const lifetime = 1000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / lifetime;
            
            if (progress < 1) {
                const positions = particles.geometry.attributes.position.array;
                
                for (let i = 0; i < velocities.length; i++) {
                    positions[i * 3] += velocities[i].x * 0.016;
                    positions[i * 3 + 1] += velocities[i].y * 0.016;
                    positions[i * 3 + 2] += velocities[i].z * 0.016;
                    
                    // Gravity
                    velocities[i].y -= 15 * 0.016;
                    velocities[i].multiplyScalar(0.99);
                }
                
                particles.geometry.attributes.position.needsUpdate = true;
                particles.material.opacity = 0.8 * (1 - progress);
                
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(particles);
            }
        };
        animate();
    }
    
    createShockwave(position, scale = 1) {
        const shockwaveGeometry = new THREE.RingGeometry(0.1, 1, 16);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
            color: 0x88aaff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.position.copy(position);
        shockwave.rotation.x = -Math.PI / 2;
        this.scene.add(shockwave);
        
        // Animate shockwave
        const startTime = Date.now();
        const duration = 800;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                shockwave.scale.setScalar(scale * (1 + progress * 10));
                shockwave.material.opacity = 0.6 * (1 - progress);
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(shockwave);
            }
        };
        animate();
    }
}