// Sound system with simple CDN-hosted audio
const sounds = {
    background: 'https://cdn.freesound.org/previews/459/459145_5622924-lq.mp3', // Ambient background loop
    bounce: 'https://cdn.freesound.org/previews/47/47356_394859-lq.mp3',       // Bounce sound
    levelComplete: 'https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3', // Level up sound
    obstacle: 'https://cdn.freesound.org/previews/254/254316_4597342-lq.mp3'    // Obstacle hit sound
};

let soundEnabled = true;
let backgroundMusic = null;

// Initialize audio
function initAudio() {
    if (!soundEnabled) return;
    
    try {
        // Start background music
        backgroundMusic = new Audio(sounds.background);
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
        
        // In some browsers, especially on mobile, audio can't autoplay without user interaction
        const playPromise = backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Auto-play prevented. Music will start on first interaction.');
                
                // Add a one-time event listener to start music on first interaction
                document.addEventListener('touchstart', function startAudio() {
                    if (soundEnabled) {
                        backgroundMusic.play().catch(e => console.log('Music playback error:', e));
                    }
                    document.removeEventListener('touchstart', startAudio);
                }, { once: true });
            });
        }
    } catch (e) {
        console.error('Audio initialization error:', e);
    }
}

// Play a sound effect
function playSound(soundType) {
    if (!soundEnabled || !sounds[soundType]) return;
    
    try {
        const sound = new Audio(sounds[soundType]);
        sound.volume = 0.4;
        
        // Add a timeout to prevent sound overlap
        setTimeout(() => {
            sound.play().catch(e => console.log('Sound play error:', e));
        }, 50);
    } catch (e) {
        console.error('Sound playback error:', e);
    }
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    // Update UI
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    }
    
    // Handle background music
    if (backgroundMusic) {
        if (soundEnabled) {
            backgroundMusic.play().catch(e => console.log('Music resume error:', e));
        } else {
            backgroundMusic.pause();
        }
    }
}

// Set up sound toggle button
document.getElementById('soundToggle').addEventListener('click', toggleSound);