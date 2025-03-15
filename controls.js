// Device motion and touch controls

// Handle device motion with comprehensive fixes for different platforms
function handleDeviceMotion(event) {
    if (!gameRunning) return;
    
    // Get acceleration including gravity
    const acceleration = event.accelerationIncludingGravity;
    
    // Check if acceleration data is available
    if (acceleration) {
        // Detect device and browser
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        // Apply platform-specific acceleration mappings
        if (isIOS && isSafari) {
            // iOS Safari specific handling
            // Try flipping both directions
            ball.vx -= acceleration.x * 0.3;
            ball.vy += acceleration.y * 0.3;
            
            // Add debug info if in debug mode
            if (window.debugMode) {
                console.log("iOS Safari acceleration:", acceleration.x, acceleration.y);
            }
        } else if (isIOS) {
            // Other iOS browsers
            ball.vx -= acceleration.x * 0.3;
            ball.vy -= acceleration.y * 0.3;
        } else if (isAndroid) {
            // Android specific
            ball.vx -= acceleration.x * 0.3;
            ball.vy += acceleration.y * 0.3;
        } else {
            // Default for other devices
            ball.vx -= acceleration.x * 0.3;
            ball.vy -= acceleration.y * 0.3;
        }
    }
}

// Toggle debug mode for acceleration values
function toggleDebugMode() {
    window.debugMode = !window.debugMode;
    const debugInfo = document.createElement('div');
    debugInfo.id = 'debug-info';
    debugInfo.style.position = 'absolute';
    debugInfo.style.bottom = '10px';
    debugInfo.style.left = '10px';
    debugInfo.style.color = 'white';
    debugInfo.style.backgroundColor = 'rgba(0,0,0,0.5)';
    debugInfo.style.padding = '5px';
    document.body.appendChild(debugInfo);
    
    // Update debug info
    window.addEventListener('devicemotion', (event) => {
        if (!window.debugMode) return;
        
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration) {
            const debugEl = document.getElementById('debug-info');
            if (debugEl) {
                debugEl.innerHTML = `AccX: ${acceleration.x.toFixed(2)}<br>AccY: ${acceleration.y.toFixed(2)}<br>AccZ: ${acceleration.z.toFixed(2)}`;
            }
        }
    });
}

// Add orientation change listener to recalibrate
window.addEventListener('orientationchange', () => {
    // Give time for orientation to stabilize
    setTimeout(() => {
        // Reset ball position but maintain game state
        if (gameRunning) {
            ball.vx = 0;
            ball.vy = 0;
        }
    }, 300);
});

// Add manual control mode
let useManualControls = false;
function toggleControlMode() {
    useManualControls = !useManualControls;
    
    if (useManualControls) {
        window.removeEventListener('devicemotion', handleDeviceMotion);
        alert('Switched to manual controls. Use touch to move the ball.');
    } else {
        window.addEventListener('devicemotion', handleDeviceMotion);
        alert('Switched to accelerometer controls.');
    }
}

// Add a control mode toggle button
function addControlModeButton() {
    const controlButton = document.createElement('button');
    controlButton.innerText = '🕹️ Controls';
    controlButton.style.position = 'absolute';
    controlButton.style.bottom = '10px';
    controlButton.style.right = '10px';
    controlButton.style.padding = '8px 12px';
    controlButton.style.backgroundColor = 'rgba(0,0,0,0.5)';
    controlButton.style.color = 'white';
    controlButton.style.border = 'none';
    controlButton.style.borderRadius = '4px';
    controlButton.style.zIndex = '100';
    
    controlButton.addEventListener('click', toggleControlMode);
    document.body.appendChild(controlButton);
}

// Add touch control fallback
function initTouchControls() {
    // Track touch movement
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!gameRunning) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchX;
        const deltaY = touch.clientY - lastTouchY;
        
        // Apply force based on touch movement
        if (useManualControls || !window.DeviceMotionEvent) {
            // More responsive touch when in manual mode
            ball.vx += deltaX * 0.3;
            ball.vy += deltaY * 0.3;
        } else {
            // Normal touch sensitivity when accelerometer is primary
            ball.vx += deltaX * 0.1;
            ball.vy += deltaY * 0.1;
        }
        
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
    });
}

// Keyboard controls for desktop testing
function initKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        const key = e.key;
        const force = 2;
        
        if (key === 'ArrowLeft') ball.vx -= force;
        if (key === 'ArrowRight') ball.vx += force;
        if (key === 'ArrowUp') ball.vy -= force;
        if (key === 'ArrowDown') ball.vy += force;
        
        // Debug mode toggle
        if (key === 'd') {
            toggleDebugMode();
        }
    });
}

// Handle fullscreen toggle
function initFullscreenButton() {
    const fullscreenButton = document.getElementById('fullscreenButton');
    
    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
}

// Initialize motion sensors (accelerometer)
function initMotionSensors() {
    return new Promise((resolve, reject) => {
        try {
            // Request permission for motion sensors (needed for iOS 13+)
            if (typeof DeviceMotionEvent !== 'undefined' && 
                typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('devicemotion', handleDeviceMotion);
                            resolve(true);
                        } else {
                            alert('Permission to access motion sensors was denied. You can still use touch controls.');
                            useManualControls = true;
                            resolve(false);
                        }
                    })
                    .catch(error => {
                        console.error('Error requesting motion permission:', error);
                        // Fallback for when permission request fails
                        useManualControls = true;
                        resolve(false);
                    });
            } else {
                // For devices that don't require permission
                window.addEventListener('devicemotion', handleDeviceMotion);
                resolve(true);
            }
        } catch (error) {
            console.error('Error initializing motion sensors:', error);
            // Fallback if there's any error in the try block
            useManualControls = true;
            resolve(false);
        }
    });
}

// Initialize all controls
function initControls() {
    initTouchControls();
    initKeyboardControls();
    initFullscreenButton();
    addControlModeButton();
    
    // Initialize debug mode
    window.debugMode = false;
}