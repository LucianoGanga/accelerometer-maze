// Device motion and touch controls

// Handle device motion - with Safari iOS fix
function handleDeviceMotion(event) {
    if (!gameRunning) return;
    
    // Get acceleration including gravity
    const acceleration = event.accelerationIncludingGravity;
    
    // Check if acceleration data is available
    if (acceleration) {
        // Apply acceleration to ball velocity
        // Safari on iOS might use different coordinate system
        let accX = acceleration.x;
        let accY = acceleration.y;
        
        // Detect iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        // FIXED: Invert X for all devices for more intuitive control
        // FIXED: For iOS Safari, invert Y (since Safari already inverts it compared to other browsers)
        if (isIOS && isSafari) {
            ball.vx += accX * -0.3;  // Invert X for better control
            ball.vy += accY * -0.3;  // Invert Y for iOS Safari
        } else {
            ball.vx += accX * -0.3;  // Invert X for better control
            ball.vy += accY * 0.3;   // Normal Y for other browsers
        }
    }
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
        ball.vx += deltaX * 0.2;
        ball.vy += deltaY * 0.2;
        
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
                            resolve(false);
                        }
                    })
                    .catch(error => {
                        console.error('Error requesting motion permission:', error);
                        // Fallback for when permission request fails
                        window.addEventListener('devicemotion', handleDeviceMotion);
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
            window.addEventListener('devicemotion', handleDeviceMotion);
            resolve(false);
        }
    });
}