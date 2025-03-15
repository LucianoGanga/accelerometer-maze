// Obstacles system
let obstacles = [];

// Add different types of obstacles based on level
function addObstacles(level, cellWidth, cellHeight) {
    if (level < 2) return; // No obstacles at level 1
    
    const obstacleCount = Math.min(15, level * 2); // More obstacles with higher levels
    
    for (let i = 0; i < obstacleCount; i++) {
        // Avoid placing obstacles near the entry or exit
        const safeZoneSize = 0.2; // 20% of the top and bottom are safe zones
        const minY = canvas.height * safeZoneSize;
        const maxY = canvas.height * (1 - safeZoneSize);
        
        const x = maze.wallWidth + Math.random() * (canvas.width - 2 * maze.wallWidth - cellWidth/2);
        const y = minY + Math.random() * (maxY - minY);
        
        // Different types of obstacles based on level
        let obstacle;
        
        // Pick obstacle type based on level
        const obstacleType = Math.floor(Math.random() * Math.min(4, level));
        
        switch (obstacleType) {
            case 0: // Spikes - stationary danger
                obstacle = {
                    type: 'spike',
                    x: x,
                    y: y,
                    width: cellWidth * 0.5,
                    height: cellHeight * 0.5,
                    color: '#ff0000',
                    dangerous: true,
                    effect: function(ball) {
                        // Spikes send the ball back to start
                        playSound('obstacle');
                        resetBall();
                    }
                };
                break;
                
            case 1: // Moving obstacle - horizontal movement
                if (level >= 3) {
                    obstacle = {
                        type: 'moving',
                        x: x,
                        y: y,
                        width: cellWidth * 0.5,
                        height: cellHeight * 0.25,
                        color: '#ff6600',
                        dangerous: true,
                        vx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1),
                        vy: 0,
                        update: function() {
                            this.x += this.vx;
                            
                            // Bounce off walls
                            if (this.x < maze.wallWidth || this.x + this.width > canvas.width - maze.wallWidth) {
                                this.vx = -this.vx;
                            }
                        },
                        effect: function(ball) {
                            // Redirect ball in obstacle's direction
                            playSound('obstacle');
                            ball.vx = this.vx * 3;
                            ball.vy = -ball.vy * 0.5;
                        }
                    };
                } else {
                    // Fallback to spikes for lower levels
                    obstacle = {
                        type: 'spike',
                        x: x,
                        y: y,
                        width: cellWidth * 0.5,
                        height: cellHeight * 0.5,
                        color: '#ff0000',
                        dangerous: true,
                        effect: function(ball) {
                            playSound('obstacle');
                            resetBall();
                        }
                    };
                }
                break;
                
            case 2: // Ice patch - slippery surface
                if (level >= 4) {
                    obstacle = {
                        type: 'ice',
                        x: x,
                        y: y,
                        width: cellWidth * 0.8,
                        height: cellHeight * 0.8,
                        color: 'rgba(0, 200, 255, 0.5)',
                        dangerous: false,
                        effect: function(ball) {
                            // Increase velocity and reduce friction
                            playSound('obstacle');
                            ball.vx *= 1.05;
                            ball.vy *= 1.05;
                        }
                    };
                } else {
                    // Fallback to moving obstacle
                    obstacle = {
                        type: 'moving',
                        x: x,
                        y: y,
                        width: cellWidth * 0.5,
                        height: cellHeight * 0.25,
                        color: '#ff6600',
                        dangerous: true,
                        vx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1),
                        vy: 0,
                        update: function() {
                            this.x += this.vx;
                            
                            // Bounce off walls
                            if (this.x < maze.wallWidth || this.x + this.width > canvas.width - maze.wallWidth) {
                                this.vx = -this.vx;
                            }
                        },
                        effect: function(ball) {
                            playSound('obstacle');
                            ball.vx = this.vx * 3;
                            ball.vy = -ball.vy * 0.5;
                        }
                    };
                }
                break;
                
            case 3: // Teleporter - randomly teleports the ball
                if (level >= 5) {
                    obstacle = {
                        type: 'teleporter',
                        x: x,
                        y: y,
                        width: cellWidth * 0.6,
                        height: cellHeight * 0.6,
                        color: '#9900ff',
                        dangerous: false,
                        effect: function(ball) {
                            // Teleport to a random position
                            playSound('obstacle');
                            const safeMargin = ball.radius * 2;
                            ball.x = maze.wallWidth + safeMargin + 
                                Math.random() * (canvas.width - 2 * maze.wallWidth - 2 * safeMargin);
                            ball.y = maze.wallWidth + safeMargin + 
                                Math.random() * (canvas.height - 2 * maze.wallWidth - 2 * safeMargin);
                            ball.vx = 0;
                            ball.vy = 0;
                        }
                    };
                } else {
                    // Fallback to ice patch
                    obstacle = {
                        type: 'ice',
                        x: x,
                        y: y,
                        width: cellWidth * 0.8,
                        height: cellHeight * 0.8,
                        color: 'rgba(0, 200, 255, 0.5)',
                        dangerous: false,
                        effect: function(ball) {
                            playSound('obstacle');
                            ball.vx *= 1.05;
                            ball.vy *= 1.05;
                        }
                    };
                }
                break;
        }
        
        obstacles.push(obstacle);
    }
}

// Check for collisions with obstacles
function checkObstacleCollisions() {
    // Check for obstacle collisions
    for (const obstacle of obstacles) {
        // Convert the ball to a rectangle for easier collision detection
        const ballRect = {
            x: ball.x - ball.radius,
            y: ball.y - ball.radius,
            width: ball.radius * 2,
            height: ball.radius * 2
        };
        
        // Check for collision
        if (rectIntersect(ballRect, obstacle)) {
            // Apply obstacle effect
            if (obstacle.effect) {
                obstacle.effect(ball);
            }
        }
    }
}