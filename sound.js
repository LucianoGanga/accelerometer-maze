// Audio system with simple CDN hosted sounds
const sounds = {
    bounce: 'https://cdn.freesound.org/previews/47/47356_394859-lq.mp3',
    levelComplete: 'https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3',
    obstacle: 'https://cdn.freesound.org/previews/254/254316_4597342-lq.mp3'
};

let soundEnabled = true;

// Play a sound effect
function playSound(soundType) {
    if (!soundEnabled || !sounds[soundType]) return;
    
    try {
        const sound = new Audio(sounds[soundType]);
        sound.volume = 0.4;
        sound.play().catch(e => console.log('Sound play error:', e));
    } catch (e) {
        console.error('Sound playback error:', e);
    }
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
}

// Set up sound toggle button
document.getElementById('soundToggle').addEventListener('click', toggleSound);