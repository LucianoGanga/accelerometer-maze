// Ball physics and management
let ball;

// Reset ball position
function resetBall() {
    // Ball properties
    const ballRadius = Math.min(canvas.width, canvas.height) * 0.025;
    // Position ball at the top entry point
    ball = {
        x: canvas.width * 0.5,
        y: ballRadius * 2,
        radius: ballRadius,
        vx: 0,
        vy: 0,
        color: '#ff4444'
    };
}

// Update ball position
function updateBall() {
    // Apply acceleration (with a maximum velocity)
    const maxVelocity = 10;
    ball.vx = Math.min(Math.max(ball.vx, -maxVelocity), maxVelocity);
    ball.vy = Math.min(Math.max(ball.vy, -maxVelocity), maxVelocity);
    
    // Apply damping (friction)
    ball.vx *= 0.98;
    ball.vy *= 0.98;
    
    // Update position
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Check boundaries
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * 0.5; // Bounce with energy loss
        playSound('bounce');
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx = -ball.vx * 0.5;
        playSound('bounce');
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * 0.5;
        playSound('bounce');
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy = -ball.vy * 0.5;
        playSound('bounce');
    }
}

// Check for collisions with walls
function checkCollisions() {
    for (const wall of maze.walls) {
        // Convert the ball to a rectangle for easier collision detection
        const ballRect = {
            x: ball.x - ball.radius,
            y: ball.y - ball.radius,
            width: ball.radius * 2,
            height: ball.radius * 2
        };
        
        // Check for collision
        if (rectIntersect(ballRect, wall)) {
            // Calculate collision response
            const ballCenter = { x: ball.x, y: ball.y };
            const wallCenter = { 
                x: wall.x + wall.width / 2, 
                y: wall.y + wall.height / 2 
            };
            
            // Determine if horizontal or vertical collision is more likely
            if (wall.width > wall.height) {
                // Horizontal wall - bounce vertically
                ball.vy = -ball.vy * 0.5;
                
                // Adjust position to prevent sticking
                if (ball.y < wallCenter.y) {
                    ball.y = wall.y - ball.radius;
                } else {
                    ball.y = wall.y + wall.height + ball.radius;
                }
                
                // Play bounce sound if velocity is significant
                if (Math.abs(ball.vy) > 1) {
                    playSound('bounce');
                }
            } else {
                // Vertical wall - bounce horizontally
                ball.vx = -ball.vx * 0.5;
                
                // Adjust position to prevent sticking
                if (ball.x < wallCenter.x) {
                    ball.x = wall.x - ball.radius;
                } else {
                    ball.x = wall.x + wall.width + ball.radius;
                }
                
                // Play bounce sound if velocity is significant
                if (Math.abs(ball.vx) > 1) {
                    playSound('bounce');
                }
            }
        }
    }
    
    // Also check for obstacle collisions
    checkObstacleCollisions();
}

// Check if ball has reached the exit
function checkExit() {
    return (
        ball.x > exit.x && 
        ball.x < exit.x + exit.width && 
        ball.y > exit.y && 
        ball.y < exit.y + exit.height
    );
}