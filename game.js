// Main game variables and logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

let gameRunning = false;
let gameTime = 0;
let timeInterval;
let currentLevel = 1;

// Set canvas dimensions to match the viewport
function resizeCanvas() {
    // Make canvas slightly smaller than viewport to ensure it fits
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.95;
    
    // If game is already initialized, recreate the maze
    if (gameRunning) {
        createMaze();
        resetBall();
    }
}

// Initialize the game
function initGame() {
    startScreen.style.display = 'none';
    gameRunning = true;
    gameTime = 0;
    
    // Set up the game timer
    timeInterval = setInterval(() => {
        gameTime++;
        document.getElementById('timeInfo').textContent = `Time: ${gameTime}s`;
    }, 1000);
    
    // Create the maze and ball
    createMaze();
    resetBall();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update ball position based on acceleration
    updateBall();
    
    // Check for collisions
    checkCollisions();
    
    // Draw everything
    drawGame();
    
    // Check for exit
    if (checkExit()) {
        gameRunning = false; // Pause game loop
        showLevelComplete();
        return; // Stop the loop until new level starts
    }
    
    // Continue the game loop
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Level complete handler
function levelComplete() {
    gameRunning = false;
    showLevelComplete();
}

// Initialize the game when the start button is clicked
startButton.addEventListener('click', async () => {
    // Initialize motion sensors
    await initMotionSensors();
    
    // Start the game
    initGame();
});

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Initial canvas setup
resizeCanvas();

// Initialize all controls
initControls();