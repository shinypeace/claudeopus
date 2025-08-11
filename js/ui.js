// UI Manager
class UIManager {
    constructor() {
        this.hudElements = {
            score: document.getElementById('score'),
            kills: document.getElementById('kills'),
            wave: document.getElementById('wave'),
            health: document.getElementById('health')
        };
        
        this.statusBars = {
            health: {
                bar: document.querySelector('#healthBar .bar-fill'),
                container: document.getElementById('healthBar')
            },
            ammo: {
                bar: document.querySelector('#ammoBar .bar-fill'),
                container: document.getElementById('ammoBar')
            }
        };
        
        this.notifications = [];
        this.setupAnimations();
    }
    
    setupAnimations() {
        // Add pulsing animation to crosshair
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            setInterval(() => {
                crosshair.style.transform = 'translate(-50%, -50%) scale(1.1)';
                setTimeout(() => {
                    crosshair.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 100);
            }, 2000);
        }
    }
    
    updateHUD(score, kills, wave, health) {
        // Animate score changes
        this.animateNumberChange(this.hudElements.score, score);
        this.animateNumberChange(this.hudElements.kills, kills);
        this.animateNumberChange(this.hudElements.wave, wave);
        this.animateNumberChange(this.hudElements.health, health);
        
        // Change health color based on value
        if (health < 30) {
            this.hudElements.health.style.color = '#ff4444';
            this.hudElements.health.style.textShadow = '0 0 10px #ff4444';
        } else if (health < 60) {
            this.hudElements.health.style.color = '#ffaa44';
            this.hudElements.health.style.textShadow = '0 0 10px #ffaa44';
        } else {
            this.hudElements.health.style.color = '#44ff44';
            this.hudElements.health.style.textShadow = '0 0 10px #44ff44';
        }
    }
    
    animateNumberChange(element, newValue) {
        if (!element) return;
        
        const oldValue = parseInt(element.textContent) || 0;
        if (oldValue !== newValue) {
            element.style.transform = 'scale(1.2)';
            element.style.color = '#00ffff';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 150);
        }
    }
    
    updateHealthBar(current, max) {
        const healthPercent = (current / max) * 100;
        const healthBar = this.statusBars.health.bar;
        
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
            
            // Change color based on health
            if (healthPercent < 30) {
                healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
                this.statusBars.health.container.style.boxShadow = '0 0 20px #ff0000';
            } else if (healthPercent < 60) {
                healthBar.style.background = 'linear-gradient(90deg, #ff8800, #ffaa44)';
                this.statusBars.health.container.style.boxShadow = '0 0 10px #ff8800';
            } else {
                healthBar.style.background = 'linear-gradient(90deg, #00ff00, #44ff44)';
                this.statusBars.health.container.style.boxShadow = '';
            }
            
            // Pulse effect when low
            if (healthPercent < 20) {
                this.statusBars.health.container.style.animation = 'pulse 1s infinite';
            } else {
                this.statusBars.health.container.style.animation = '';
            }
        }
    }
    
    updateAmmoBar(current, max) {
        const ammoPercent = (current / max) * 100;
        const ammoBar = this.statusBars.ammo.bar;
        
        if (ammoBar) {
            ammoBar.style.width = `${ammoPercent}%`;
            
            // Change color based on ammo
            if (ammoPercent < 20) {
                ammoBar.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
                this.statusBars.ammo.container.style.boxShadow = '0 0 15px #ff0000';
            } else if (ammoPercent < 50) {
                ammoBar.style.background = 'linear-gradient(90deg, #ffaa00, #ffcc44)';
                this.statusBars.ammo.container.style.boxShadow = '0 0 10px #ffaa00';
            } else {
                ammoBar.style.background = 'linear-gradient(90deg, #ffff00, #ff8800)';
                this.statusBars.ammo.container.style.boxShadow = '';
            }
        }
    }
    
    showWaveMessage(waveNumber) {
        this.showNotification(`ВОЛНА ${waveNumber}`, '#00ffff', 3000, 'large');
        
        // Screen flash effect
        this.flashScreen('#004488', 500);
    }
    
    showNotification(message, color = '#ffffff', duration = 2000, size = 'normal') {
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.color = color;
        notification.style.fontSize = size === 'large' ? '3em' : '1.5em';
        notification.style.fontWeight = 'bold';
        notification.style.textShadow = `0 0 20px ${color}`;
        notification.style.textAlign = 'center';
        notification.style.pointerEvents = 'none';
        notification.style.zIndex = '150';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -50%) scale(0.5)';
        
        setTimeout(() => {
            notification.style.transition = 'all 0.5s ease';
            notification.style.opacity = '1';
            notification.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 50);
        
        // Animate out
        setTimeout(() => {
            notification.style.transition = 'all 0.5s ease';
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(1.2)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, duration);
    }
    
    flashScreen(color = '#ff0000', duration = 300) {
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.background = color;
        flash.style.opacity = '0.3';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '120';
        
        document.getElementById('ui').appendChild(flash);
        
        setTimeout(() => {
            flash.style.transition = `opacity ${duration}ms ease`;
            flash.style.opacity = '0';
            
            setTimeout(() => {
                if (flash.parentNode) {
                    flash.parentNode.removeChild(flash);
                }
            }, duration);
        }, 50);
    }
    
    showDamageDirection(direction) {
        // Show damage indicator at screen edge
        const indicator = document.createElement('div');
        indicator.style.position = 'absolute';
        indicator.style.width = '20px';
        indicator.style.height = '20px';
        indicator.style.background = 'radial-gradient(circle, #ff0000, transparent)';
        indicator.style.pointerEvents = 'none';
        indicator.style.zIndex = '110';
        
        // Calculate position based on direction
        const angle = Math.atan2(direction.z, direction.x);
        const x = 50 + Math.cos(angle) * 40; // 40% from center
        const y = 50 + Math.sin(angle) * 40;
        
        indicator.style.left = `${x}%`;
        indicator.style.top = `${y}%`;
        indicator.style.transform = 'translate(-50%, -50%)';
        
        document.getElementById('ui').appendChild(indicator);
        
        // Fade out
        setTimeout(() => {
            indicator.style.transition = 'opacity 1s ease';
            indicator.style.opacity = '0';
            
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 1000);
        }, 100);
    }
    
    showReloadIndicator(progress) {
        let reloadIndicator = document.getElementById('reloadIndicator');
        
        if (!reloadIndicator) {
            reloadIndicator = document.createElement('div');
            reloadIndicator.id = 'reloadIndicator';
            reloadIndicator.style.position = 'absolute';
            reloadIndicator.style.bottom = '100px';
            reloadIndicator.style.left = '50%';
            reloadIndicator.style.transform = 'translateX(-50%)';
            reloadIndicator.style.width = '200px';
            reloadIndicator.style.height = '20px';
            reloadIndicator.style.background = 'rgba(0,0,0,0.5)';
            reloadIndicator.style.border = '2px solid #fff';
            reloadIndicator.style.borderRadius = '10px';
            reloadIndicator.style.overflow = 'hidden';
            reloadIndicator.style.pointerEvents = 'none';
            reloadIndicator.style.zIndex = '110';
            
            const fill = document.createElement('div');
            fill.style.height = '100%';
            fill.style.background = 'linear-gradient(90deg, #ff8800, #ffaa00)';
            fill.style.width = '0%';
            fill.style.transition = 'width 0.1s ease';
            reloadIndicator.appendChild(fill);
            
            const text = document.createElement('div');
            text.style.position = 'absolute';
            text.style.top = '50%';
            text.style.left = '50%';
            text.style.transform = 'translate(-50%, -50%)';
            text.style.fontSize = '12px';
            text.style.fontWeight = 'bold';
            text.style.color = '#fff';
            text.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
            text.textContent = 'RELOADING...';
            reloadIndicator.appendChild(text);
            
            document.getElementById('ui').appendChild(reloadIndicator);
        }
        
        const fill = reloadIndicator.querySelector('div');
        if (fill) {
            fill.style.width = `${progress * 100}%`;
        }
        
        if (progress >= 1) {
            setTimeout(() => {
                if (reloadIndicator && reloadIndicator.parentNode) {
                    reloadIndicator.parentNode.removeChild(reloadIndicator);
                }
            }, 200);
        }
    }
    
    showKillStreak(streakCount) {
        if (streakCount < 3) return;
        
        let message = '';
        let color = '#ffff00';
        
        if (streakCount >= 10) {
            message = 'LEGENDARY!';
            color = '#ff00ff';
        } else if (streakCount >= 7) {
            message = 'RAMPAGE!';
            color = '#ff4400';
        } else if (streakCount >= 5) {
            message = 'KILLING SPREE!';
            color = '#ff8800';
        } else if (streakCount >= 3) {
            message = 'MULTI KILL!';
            color = '#ffff00';
        }
        
        this.showNotification(message, color, 2000, 'large');
    }
    
    createCompass(playerPosition, enemies) {
        // Remove existing compass
        const existingCompass = document.getElementById('compass');
        if (existingCompass) {
            existingCompass.remove();
        }
        
        const compass = document.createElement('div');
        compass.id = 'compass';
        compass.style.position = 'absolute';
        compass.style.top = '80px';
        compass.style.right = '80px';
        compass.style.width = '120px';
        compass.style.height = '120px';
        compass.style.border = '2px solid #00ffff';
        compass.style.borderRadius = '50%';
        compass.style.background = 'rgba(0,0,0,0.3)';
        compass.style.pointerEvents = 'none';
        compass.style.zIndex = '110';
        
        // Add enemy dots
        enemies.forEach(enemy => {
            const direction = new THREE.Vector3()
                .subVectors(enemy.mesh.position, playerPosition)
                .normalize();
            
            const distance = enemy.mesh.position.distanceTo(playerPosition);
            const maxRange = 50;
            const relativeDistance = Math.min(distance / maxRange, 1);
            
            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.borderRadius = '50%';
            dot.style.background = enemy.type === 'boss' ? '#ff0000' : '#ff8800';
            dot.style.boxShadow = `0 0 10px ${enemy.type === 'boss' ? '#ff0000' : '#ff8800'}`;
            
            // Position on compass
            const angle = Math.atan2(direction.z, direction.x);
            const compassRadius = 50 * relativeDistance;
            const x = 60 + Math.cos(angle) * compassRadius;
            const y = 60 + Math.sin(angle) * compassRadius;
            
            dot.style.left = `${x - 3}px`;
            dot.style.top = `${y - 3}px`;
            
            compass.appendChild(dot);
        });
        
        document.getElementById('ui').appendChild(compass);
    }
    
    showWeaponInfo(weapon) {
        const weaponInfo = document.createElement('div');
        weaponInfo.style.position = 'absolute';
        weaponInfo.style.bottom = '80px';
        weaponInfo.style.right = '30px';
        weaponInfo.style.padding = '10px';
        weaponInfo.style.background = 'rgba(0,0,0,0.7)';
        weaponInfo.style.border = '1px solid #00ffff';
        weaponInfo.style.borderRadius = '5px';
        weaponInfo.style.color = '#fff';
        weaponInfo.style.fontSize = '14px';
        weaponInfo.style.pointerEvents = 'none';
        weaponInfo.style.zIndex = '110';
        
        weaponInfo.innerHTML = `
            <div style="color: #00ffff; font-weight: bold;">${weapon.name}</div>
            <div>Урон: ${weapon.damage}</div>
            <div>Скорострельность: ${(1/weapon.fireRate).toFixed(1)}/сек</div>
            <div>Боеприпасы: ${weapon.ammo}/${weapon.maxAmmo}</div>
        `;
        
        document.getElementById('ui').appendChild(weaponInfo);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (weaponInfo.parentNode) {
                weaponInfo.parentNode.removeChild(weaponInfo);
            }
        }, 3000);
    }
    
    showPowerupNotification(powerupType) {
        let message = '';
        let color = '#ffffff';
        
        switch (powerupType) {
            case 'health':
                message = '+25 ЗДОРОВЬЯ';
                color = '#00ff00';
                break;
            case 'ammo':
                message = 'БОЕПРИПАСЫ ВОССТАНОВЛЕНЫ';
                color = '#ffff00';
                break;
            case 'damage':
                message = 'УРОН УВЕЛИЧЕН!';
                color = '#ff0000';
                break;
            case 'speed':
                message = 'СКОРОСТЬ УВЕЛИЧЕНА!';
                color = '#00ffff';
                break;
        }
        
        this.showNotification(message, color, 2000);
    }
    
    createHitMarker(position) {
        // Create hit marker at screen position
        const hitMarker = document.createElement('div');
        hitMarker.style.position = 'absolute';
        hitMarker.style.left = '50%';
        hitMarker.style.top = '50%';
        hitMarker.style.width = '40px';
        hitMarker.style.height = '40px';
        hitMarker.style.transform = 'translate(-50%, -50%)';
        hitMarker.style.pointerEvents = 'none';
        hitMarker.style.zIndex = '130';
        
        // Create X shape
        hitMarker.innerHTML = `
            <div style="position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: #ff0000; transform: translateY(-50%) rotate(45deg);"></div>
            <div style="position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: #ff0000; transform: translateY(-50%) rotate(-45deg);"></div>
        `;
        
        document.getElementById('ui').appendChild(hitMarker);
        
        // Animate hit marker
        setTimeout(() => {
            hitMarker.style.transition = 'all 0.3s ease';
            hitMarker.style.opacity = '0';
            hitMarker.style.transform = 'translate(-50%, -50%) scale(1.5)';
            
            setTimeout(() => {
                if (hitMarker.parentNode) {
                    hitMarker.parentNode.removeChild(hitMarker);
                }
            }, 300);
        }, 100);
    }
    
    showLowHealthWarning() {
        // Create pulsing red border
        const warning = document.createElement('div');
        warning.id = 'lowHealthWarning';
        warning.style.position = 'absolute';
        warning.style.top = '0';
        warning.style.left = '0';
        warning.style.width = '100%';
        warning.style.height = '100%';
        warning.style.border = '10px solid #ff0000';
        warning.style.boxSizing = 'border-box';
        warning.style.pointerEvents = 'none';
        warning.style.zIndex = '105';
        warning.style.opacity = '0.5';
        warning.style.animation = 'pulse 1s infinite';
        
        document.getElementById('ui').appendChild(warning);
        
        return warning;
    }
    
    removeLowHealthWarning() {
        const warning = document.getElementById('lowHealthWarning');
        if (warning) {
            warning.remove();
        }
    }
    
    showObjectiveMarker(position, text) {
        // Create 3D marker for objectives
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = '#00ffff';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeText(text, 128, 40);
        context.fillText(text, 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.copy(position);
        sprite.position.y += 5;
        sprite.scale.set(8, 2, 1);
        
        if (window.game && window.game.scene) {
            window.game.scene.add(sprite);
            
            // Remove after 5 seconds
            setTimeout(() => {
                window.game.scene.remove(sprite);
            }, 5000);
        }
        
        return sprite;
    }
    
    updateCrosshair(isTargeting = false) {
        const crosshair = document.getElementById('crosshair');
        if (!crosshair) return;
        
        if (isTargeting) {
            crosshair.style.borderColor = '#ff0000';
            crosshair.style.boxShadow = '0 0 20px #ff0000';
            crosshair.style.transform = 'translate(-50%, -50%) scale(1.2)';
        } else {
            crosshair.style.borderColor = '#00ff00';
            crosshair.style.boxShadow = '';
            crosshair.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    }
    
    createMiniMap(playerPosition, enemies, powerups) {
        // Remove existing minimap
        const existingMinimap = document.getElementById('minimap');
        if (existingMinimap) {
            existingMinimap.remove();
        }
        
        const minimap = document.createElement('div');
        minimap.id = 'minimap';
        minimap.style.position = 'absolute';
        minimap.style.top = '20px';
        minimap.style.right = '20px';
        minimap.style.width = '150px';
        minimap.style.height = '150px';
        minimap.style.border = '2px solid #00ffff';
        minimap.style.borderRadius = '10px';
        minimap.style.background = 'rgba(0,0,0,0.5)';
        minimap.style.pointerEvents = 'none';
        minimap.style.zIndex = '110';
        
        // Player dot (center)
        const playerDot = document.createElement('div');
        playerDot.style.position = 'absolute';
        playerDot.style.left = '50%';
        playerDot.style.top = '50%';
        playerDot.style.width = '8px';
        playerDot.style.height = '8px';
        playerDot.style.background = '#00ff00';
        playerDot.style.borderRadius = '50%';
        playerDot.style.transform = 'translate(-50%, -50%)';
        playerDot.style.boxShadow = '0 0 10px #00ff00';
        minimap.appendChild(playerDot);
        
        // Enemy dots
        const mapRange = 50;
        enemies.forEach(enemy => {
            const relativePos = new THREE.Vector3()
                .subVectors(enemy.mesh.position, playerPosition);
            
            if (relativePos.length() <= mapRange) {
                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.width = enemy.type === 'boss' ? '8px' : '4px';
                dot.style.height = enemy.type === 'boss' ? '8px' : '4px';
                dot.style.background = enemy.type === 'boss' ? '#ff0000' : '#ff8800';
                dot.style.borderRadius = '50%';
                
                const x = 75 + (relativePos.x / mapRange) * 60;
                const y = 75 + (relativePos.z / mapRange) * 60;
                
                dot.style.left = `${x}px`;
                dot.style.top = `${y}px`;
                dot.style.transform = 'translate(-50%, -50%)';
                
                minimap.appendChild(dot);
            }
        });
        
        // Powerup dots
        powerups.forEach(powerup => {
            const relativePos = new THREE.Vector3()
                .subVectors(powerup.mesh.position, playerPosition);
            
            if (relativePos.length() <= mapRange) {
                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.width = '6px';
                dot.style.height = '6px';
                dot.style.background = '#00ffff';
                dot.style.borderRadius = '50%';
                dot.style.boxShadow = '0 0 5px #00ffff';
                
                const x = 75 + (relativePos.x / mapRange) * 60;
                const y = 75 + (relativePos.z / mapRange) * 60;
                
                dot.style.left = `${x}px`;
                dot.style.top = `${y}px`;
                dot.style.transform = 'translate(-50%, -50%)';
                
                minimap.appendChild(dot);
            }
        });
        
        document.getElementById('ui').appendChild(minimap);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
        100% { transform: translateX(0); }
    }
    
    @keyframes glow {
        0% { box-shadow: 0 0 5px currentColor; }
        50% { box-shadow: 0 0 20px currentColor; }
        100% { box-shadow: 0 0 5px currentColor; }
    }
`;
document.head.appendChild(style);