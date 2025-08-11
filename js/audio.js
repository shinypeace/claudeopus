// Audio Manager
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sounds = {};
        this.backgroundMusic = null;
        this.musicGain = null;
        
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.7;
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = 0.3;
            
            this.generateSounds();
            this.createBackgroundMusic();
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    generateSounds() {
        if (!this.audioContext) return;
        
        // Generate sound effects procedurally
        this.sounds = {
            shoot: this.createShootSound(),
            hit: this.createHitSound(),
            enemyDeath: this.createEnemyDeathSound(),
            powerup: this.createPowerupSound(),
            reload: this.createReloadSound(),
            weaponSwitch: this.createWeaponSwitchSound(),
            gameOver: this.createGameOverSound(),
            bossAttack: this.createBossAttackSound()
        };
    }
    
    createShootSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Sharp attack with quick decay
            const envelope = Math.exp(-t * 50);
            const noise = (Math.random() * 2 - 1) * 0.3;
            const tone = Math.sin(2 * Math.PI * 800 * t) * 0.7;
            data[i] = (noise + tone) * envelope;
        }
        
        return buffer;
    }
    
    createHitSound() {
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 20);
            const noise = (Math.random() * 2 - 1) * 0.5;
            const impact = Math.sin(2 * Math.PI * 200 * t) * 0.8;
            data[i] = (noise + impact) * envelope;
        }
        
        return buffer;
    }
    
    createEnemyDeathSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5);
            const frequency = 400 - t * 300; // Falling pitch
            const explosion = Math.sin(2 * Math.PI * frequency * t) * 0.6;
            const noise = (Math.random() * 2 - 1) * 0.4 * envelope;
            data[i] = (explosion + noise) * envelope;
        }
        
        return buffer;
    }
    
    createPowerupSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = 1 - t / duration;
            const frequency = 440 + t * 440; // Rising pitch
            const chime = Math.sin(2 * Math.PI * frequency * t) * 0.5;
            const harmonic = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.2;
            data[i] = (chime + harmonic) * envelope;
        }
        
        return buffer;
    }
    
    createReloadSound() {
        const duration = 0.4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            let sound = 0;
            
            // Click sound at start
            if (t < 0.05) {
                sound = (Math.random() * 2 - 1) * 0.8 * Math.exp(-t * 100);
            }
            // Mechanical sound in middle
            else if (t < 0.3) {
                const envelope = Math.sin((t - 0.05) / 0.25 * Math.PI) * 0.3;
                sound = (Math.random() * 2 - 1) * envelope;
            }
            // Final click
            else {
                const envelope = Math.exp(-(t - 0.3) * 50);
                sound = (Math.random() * 2 - 1) * 0.6 * envelope;
            }
            
            data[i] = sound;
        }
        
        return buffer;
    }
    
    createWeaponSwitchSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            const sweep = Math.sin(2 * Math.PI * (600 + t * 400) * t) * 0.4;
            const click = (Math.random() * 2 - 1) * 0.2 * envelope;
            data[i] = (sweep + click) * envelope;
        }
        
        return buffer;
    }
    
    createGameOverSound() {
        const duration = 2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2);
            const frequency = 220 - t * 100; // Falling pitch
            const tone = Math.sin(2 * Math.PI * frequency * t) * 0.5;
            const reverb = Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.2;
            data[i] = (tone + reverb) * envelope;
        }
        
        return buffer;
    }
    
    createBossAttackSound() {
        const duration = 1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.sin(t / duration * Math.PI) * 0.8;
            const lowFreq = Math.sin(2 * Math.PI * 60 * t) * 0.6;
            const midFreq = Math.sin(2 * Math.PI * 200 * t) * 0.4;
            const noise = (Math.random() * 2 - 1) * 0.3;
            data[i] = (lowFreq + midFreq + noise) * envelope;
        }
        
        return buffer;
    }
    
    createBackgroundMusic() {
        if (!this.audioContext) return;
        
        // Create ambient space music
        this.musicOscillators = [];
        this.createAmbientLayer();
        this.createMelodyLayer();
        this.createRhythmLayer();
    }
    
    createAmbientLayer() {
        // Deep space ambient pad
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator1.type = 'sawtooth';
        oscillator1.frequency.value = 55; // Low A
        oscillator2.type = 'sine';
        oscillator2.frequency.value = 82.5; // E
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;
        
        gain.gain.value = 0.1;
        
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        oscillator1.start();
        oscillator2.start();
        
        this.musicOscillators.push(oscillator1, oscillator2);
        
        // Slowly modulate frequency
        setInterval(() => {
            if (oscillator1.frequency) {
                oscillator1.frequency.setValueAtTime(
                    55 + Math.sin(Date.now() * 0.0001) * 5,
                    this.audioContext.currentTime
                );
                oscillator2.frequency.setValueAtTime(
                    82.5 + Math.cos(Date.now() * 0.00015) * 3,
                    this.audioContext.currentTime
                );
            }
        }, 100);
    }
    
    createMelodyLayer() {
        // Ethereal melody
        const melodyNotes = [220, 246.94, 277.18, 329.63, 369.99]; // A, B, C#, E, F#
        let currentNoteIndex = 0;
        
        const playMelodyNote = () => {
            if (!this.audioContext || this.audioContext.state === 'closed') return;
            
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = melodyNotes[currentNoteIndex];
            
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
            
            oscillator.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 2);
            
            currentNoteIndex = (currentNoteIndex + 1) % melodyNotes.length;
            
            // Schedule next note
            setTimeout(playMelodyNote, 3000 + Math.random() * 2000);
        };
        
        // Start melody after delay
        setTimeout(playMelodyNote, 2000);
    }
    
    createRhythmLayer() {
        // Subtle percussion
        const playBeat = () => {
            if (!this.audioContext || this.audioContext.state === 'closed') return;
            
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.value = 80;
            
            gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(gain);
            gain.connect(this.musicGain);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
            
            setTimeout(playBeat, 2000);
        };
        
        setTimeout(playBeat, 1000);
    }
    
    playSound(soundName, volume = 1, pitch = 1) {
        if (!this.audioContext || !this.sounds[soundName]) return;
        
        try {
            const source = this.audioContext.createBufferSource();
            const gain = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            source.playbackRate.value = pitch;
            gain.gain.value = volume * 0.5;
            
            source.connect(gain);
            gain.connect(this.masterGain);
            
            source.start();
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }
    
    playShootSound() {
        this.playSound('shoot', 0.3, 1 + (Math.random() - 0.5) * 0.1);
    }
    
    playHitSound() {
        this.playSound('hit', 0.4, 1 + (Math.random() - 0.5) * 0.2);
    }
    
    playEnemyDeathSound() {
        this.playSound('enemyDeath', 0.5, 1 + (Math.random() - 0.5) * 0.3);
    }
    
    playPowerupSound() {
        this.playSound('powerup', 0.6, 1 + (Math.random() - 0.5) * 0.1);
    }
    
    playReloadSound() {
        this.playSound('reload', 0.4);
    }
    
    playWeaponSwitchSound() {
        this.playSound('weaponSwitch', 0.3);
    }
    
    playGameOverSound() {
        this.playSound('gameOver', 0.8);
    }
    
    playBossAttackSound() {
        this.playSound('bossAttack', 0.7, 0.8 + Math.random() * 0.4);
    }
    
    playBackgroundMusic() {
        if (!this.audioContext) return;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 2);
    }
    
    pauseBackgroundMusic() {
        if (!this.audioContext || !this.musicGain) return;
        
        this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
    }
    
    resumeBackgroundMusic() {
        if (!this.audioContext || !this.musicGain) return;
        
        this.musicGain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 1);
    }
    
    stopBackgroundMusic() {
        if (!this.audioContext || !this.musicGain) return;
        
        this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
    }
    
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    setMusicVolume(volume) {
        if (this.musicGain) {
            this.musicGain.gain.value = Math.max(0, Math.min(1, volume)) * 0.3;
        }
    }
    
    // 3D positional audio
    play3DSound(soundName, position, volume = 1) {
        if (!this.audioContext || !this.sounds[soundName] || !window.game || !window.game.camera) return;
        
        try {
            const source = this.audioContext.createBufferSource();
            const panner = this.audioContext.createPanner();
            const gain = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            
            // Configure 3D audio
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.maxDistance = 100;
            panner.rolloffFactor = 1;
            
            // Set position
            panner.positionX.value = position.x;
            panner.positionY.value = position.y;
            panner.positionZ.value = position.z;
            
            // Set listener position (camera)
            const listener = this.audioContext.listener;
            const cameraPos = window.game.camera.position;
            listener.positionX.value = cameraPos.x;
            listener.positionY.value = cameraPos.y;
            listener.positionZ.value = cameraPos.z;
            
            gain.gain.value = volume * 0.5;
            
            source.connect(panner);
            panner.connect(gain);
            gain.connect(this.masterGain);
            
            source.start();
        } catch (error) {
            console.warn('Error playing 3D sound:', error);
        }
    }
    
    createExplosionSound(position, scale = 1) {
        if (!this.audioContext) return;
        
        const duration = 0.8 * scale;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * (3 / scale));
            const lowBoom = Math.sin(2 * Math.PI * 40 * t) * 0.8;
            const midCrack = Math.sin(2 * Math.PI * 150 * t) * 0.4;
            const noise = (Math.random() * 2 - 1) * 0.6;
            data[i] = (lowBoom + midCrack + noise) * envelope;
        }
        
        // Play as 3D sound
        try {
            const source = this.audioContext.createBufferSource();
            const panner = this.audioContext.createPanner();
            const gain = this.audioContext.createGain();
            
            source.buffer = buffer;
            
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 5;
            panner.maxDistance = 100;
            
            panner.positionX.value = position.x;
            panner.positionY.value = position.y;
            panner.positionZ.value = position.z;
            
            gain.gain.value = 0.6 * scale;
            
            source.connect(panner);
            panner.connect(gain);
            gain.connect(this.masterGain);
            
            source.start();
        } catch (error) {
            console.warn('Error playing explosion sound:', error);
        }
    }
    
    createFootstepSound(surface = 'metal') {
        if (!this.audioContext) return;
        
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 30);
            
            let sound = 0;
            switch (surface) {
                case 'metal':
                    sound = (Math.random() * 2 - 1) * 0.4 + Math.sin(2 * Math.PI * 800 * t) * 0.2;
                    break;
                case 'rock':
                    sound = (Math.random() * 2 - 1) * 0.6;
                    break;
                default:
                    sound = (Math.random() * 2 - 1) * 0.3;
            }
            
            data[i] = sound * envelope;
        }
        
        try {
            const source = this.audioContext.createBufferSource();
            const gain = this.audioContext.createGain();
            
            source.buffer = buffer;
            gain.gain.value = 0.1;
            
            source.connect(gain);
            gain.connect(this.masterGain);
            
            source.start();
        } catch (error) {
            console.warn('Error playing footstep sound:', error);
        }
    }
}