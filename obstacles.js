// Enhanced obstacles system with improved behaviors
let obstacles = [];
let explosionEffects = []; // Array to track active explosion animations

// Add obstacles based on level configuration
function addObstacles(config, random, cellWidth, cellHeight) {
    // Track teleporters to create pairs
    let teleporterPairs = [];
    
    // Distribute obstacles evenly based on the level config
    const obstacleCount = config.obstacleCount;
    
    // Create teleporters in pairs first (if needed)
    if (config.obstacleTypes.includes('teleporter')) {
        // Calculate how many teleporter pairs to create (up to 20% of obstacles)
        const teleporterPairCount = Math.floor(obstacleCount * 0.2);
        
        for (let i = 0; i < teleporterPairCount; i++) {
            createTeleporterPair(random, cellWidth, cellHeight);
        }
    }
    
    // Create remaining obstacles
    const remainingCount = obstacleCount - (teleporterPairs.length * 2);
    
    for (let i = 0; i < remainingCount; i++) {
        // Avoid placing obstacles near the entry or exit
        const safeZoneSize = 0.15; // 15% of the top and bottom are safe zones
        const minY = canvas.height * safeZoneSize;
        const maxY = canvas.height * (1 - safeZoneSize);
        
        const x = maze.wallWidth + random.range(0, canvas.width - 2 * maze.wallWidth - cellWidth/2);
        const y = minY + random.range(0, maxY - minY);
        
        // Choose a random obstacle type from the available types for this level
        const obstacleType = config.obstacleTypes[random.rangeInt(0, config.obstacleTypes.length)];
        
        // Skip teleporters as they were already created in pairs
        if (obstacleType === 'teleporter') continue;
        
        // Create the obstacle based on type
        createObstacle(obstacleType, x, y, cellWidth, cellHeight, random);
    }
}

// Create a specific obstacle type
function createObstacle(type, x, y, cellWidth, cellHeight, random) {
    let obstacle;
    
    switch (type) {
        case 'spike':
            obstacle = {
                type: 'spike',
                x: x,
                y: y,
                width: cellWidth * 0.5,
                height: cellHeight * 0.5,
                color: '#ff0000',
                dangerous: true,
                // Store spike points for precise collision detection
                points: [
                    { x: x, y: y + cellHeight * 0.5 },                    // Bottom left
                    { x: x + cellWidth * 0.25, y: y },                     // Top middle
                    { x: x + cellWidth * 0.5, y: y + cellHeight * 0.5 }    // Bottom right
                ],
                effect: function(ball) {
                    // Check for precise collision with triangle shape
                    if (triangleCircleCollision(this.points, ball)) {
                        // Ball hit the spiky part - create explosion and reset
                        createExplosion(ball.x, ball.y);
                        playSound('obstacle');
                        resetBall();
                    }
                    // If not hitting the actual spike part, no effect
                }
            };
            obstacles.push(obstacle);
            break;
            
        case 'moving':
            obstacle = {
                type: 'moving',
                x: x,
                y: y,
                width: cellWidth * 0.5,
                height: cellHeight * 0.25,
                color: '#ff6600',
                dangerous: true,
                vx: (random.range(1, 3)) * (random.random() < 0.5 ? 1 : -1),
                vy: 0,
                update: function() {
                    const prevX = this.x;
                    this.x += this.vx;
                    
                    // Bounce off walls
                    if (this.x < maze.wallWidth || this.x + this.width > canvas.width - maze.wallWidth) {
                        this.vx = -this.vx;
                        this.x = prevX; // Prevent sticking in walls
                    }
                },
                effect: function(ball) {
                    // Check if ball is getting crushed against something
                    const nextBallX = ball.x + this.vx;
                    const nextBallY = ball.y;
                    
                    // Check if the new position would collide with any wall
                    let crushed = false;
                    
                    for (const wall of maze.walls) {
                        if (circleRectCollision(
                            {x: nextBallX, y: nextBallY, radius: ball.radius},
                            wall
                        )) {
                            crushed = true;
                            break;
                        }
                    }
                    
                    // Check if crushed by other obstacles
                    for (const otherObstacle of obstacles) {
                        if (otherObstacle === this) continue;
                        
                        if (circleRectCollision(
                            {x: nextBallX, y: nextBallY, radius: ball.radius},
                            otherObstacle
                        )) {
                            crushed = true;
                            break;
                        }
                    }
                    
                    if (crushed) {
                        // Ball is crushed! Create explosion and reset
                        createExplosion(ball.x, ball.y);
                        playSound('obstacle');
                        resetBall();
                    } else {
                        // Normal collision - push the ball
                        ball.vx = this.vx * 2;
                        ball.vy = -ball.vy * 0.5;
                    }
                }
            };
            obstacles.push(obstacle);
            break;
            
        case 'ice':
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
            obstacles.push(obstacle);
            break;
    }
}

// Create a pair of linked teleporters
function createTeleporterPair(random, cellWidth, cellHeight) {
    // Create first teleporter
    const safeZoneSize = 0.15;
    const minY = canvas.height * safeZoneSize;
    const maxY = canvas.height * (1 - safeZoneSize);
    
    // Position teleporters away from each other
    const x1 = maze.wallWidth + random.range(0, canvas.width * 0.4 - cellWidth);
    const y1 = minY + random.range(0, maxY - minY);
    
    const x2 = maze.wallWidth + canvas.width * 0.6 + random.range(0, canvas.width * 0.4 - maze.wallWidth - cellWidth);
    const y2 = minY + random.range(0, maxY - minY);
    
    // Create the pair
    const teleporter1 = {
        type: 'teleporter',
        x: x1,
        y: y1,
        width: cellWidth * 0.6,
        height: cellHeight * 0.6,
        color: '#9900ff',
        dangerous: false,
        id: Date.now() + random.random(), // Unique ID for this pair
        partner: null, // Will be set after both are created
        cooldown: 0, // Prevent immediate re-teleportation
        effect: function(ball) {
            // Only teleport if cooldown is over
            if (this.cooldown <= 0 && this.partner) {
                playSound('obstacle');
                
                // Create teleport effect at current position
                createTeleportEffect(ball.x, ball.y);
                
                // Teleport to partner teleporter
                // Position ball at center of partner teleporter
                ball.x = this.partner.x + this.partner.width/2;
                ball.y = this.partner.y + this.partner.height/2;
                
                // Create arrival effect at new position
                createTeleportEffect(ball.x, ball.y);
                
                // Stop momentum
                ball.vx = 0;
                ball.vy = 0;
                
                // Set cooldown on both teleporters
                this.cooldown = 60; // frames of cooldown (about 1 second)
                this.partner.cooldown = 60;
            }
        },
        update: function() {
            // Decrease cooldown counter
            if (this.cooldown > 0) {
                this.cooldown--;
            }
        }
    };
    
    const teleporter2 = {
        type: 'teleporter',
        x: x2,
        y: y2,
        width: cellWidth * 0.6,
        height: cellHeight * 0.6,
        color: '#9900ff',
        dangerous: false,
        id: teleporter1.id, // Same ID to show they're a pair
        partner: null, // Will be set after both are created
        cooldown: 0,
        effect: function(ball) {
            // Only teleport if cooldown is over
            if (this.cooldown <= 0 && this.partner) {
                playSound('obstacle');
                
                // Create teleport effect at current position
                createTeleportEffect(ball.x, ball.y);
                
                // Teleport to partner teleporter
                ball.x = this.partner.x + this.partner.width/2;
                ball.y = this.partner.y + this.partner.height/2;
                
                // Create arrival effect at new position
                createTeleportEffect(ball.x, ball.y);
                
                // Stop momentum
                ball.vx = 0;
                ball.vy = 0;
                
                // Set cooldown on both teleporters
                this.cooldown = 60; // frames of cooldown
                this.partner.cooldown = 60;
            }
        },
        update: function() {
            // Decrease cooldown counter
            if (this.cooldown > 0) {
                this.cooldown--;
            }
        }
    };
    
    // Link the teleporters to each other
    teleporter1.partner = teleporter2;
    teleporter2.partner = teleporter1;
    
    // Add them to obstacles array
    obstacles.push(teleporter1);
    obstacles.push(teleporter2);
}

// Create a teleport effect animation
function createTeleportEffect(x, y) {
    // We'll reuse the explosion system for simplicity
    const effect = {
        x: x,
        y: y,
        radius: 10,
        alpha: 1,
        color: '#9900ff',
        growRate: 1.4,
        fadeRate: 0.04
    };
    
    explosionEffects.push(effect);
}

// Create an explosion effect at a position
function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        const size = Math.random() * 8 + 2;
        const life = Math.random() * 30 + 20;
        
        const particle = {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: size,
            alpha: 1,
            life: life,
            color: '#ff4444',
            update: function() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha = this.life / 30;
                this.life--;
                this.radius -= 0.05;
            }
        };
        
        explosionEffects.push(particle);
    }
    
    // Also add a shockwave effect
    explosionEffects.push({
        x: x,
        y: y,
        radius: 10,
        alpha: 0.7,
        color: '#ffffff',
        growRate: 2,
        fadeRate: 0.05
    });
}

// Update explosion effects
function updateExplosionEffects() {
    for (let i = explosionEffects.length - 1; i >= 0; i--) {
        const effect = explosionEffects[i];
        
        if (effect.update) {
            effect.update();
            if (effect.life <= 0 || effect.radius <= 0) {
                explosionEffects.splice(i, 1);
            }
        } else if (effect.growRate) {
            // Shockwave or teleport effect
            effect.radius += effect.growRate;
            effect.alpha -= effect.fadeRate;
            
            if (effect.alpha <= 0) {
                explosionEffects.splice(i, 1);
            }
        }
    }
}

// Draw explosion effects
function drawExplosionEffects() {
    for (const effect of explosionEffects) {
        ctx.globalAlpha = effect.alpha;
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Check for collisions with obstacles
function checkObstacleCollisions() {
    // Update obstacles
    for (const obstacle of obstacles) {
        if (obstacle.update) {
            obstacle.update();
        }
    }
    
    // Update explosion effects
    updateExplosionEffects();
    
    // Check for obstacle collisions
    for (const obstacle of obstacles) {
        // For spikes we use triangle-circle collision
        if (obstacle.type === 'spike') {
            // The effect function handles the collision check
            obstacle.effect(ball);
        } else {
            // For other obstacles, use standard collision
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
}

// Triangle-Circle collision detection
function triangleCircleCollision(points, circle) {
    // Check if circle center is inside triangle
    if (pointInTriangle(circle.x, circle.y, points)) {
        return true;
    }
    
    // Check if circle intersects with any of the triangle sides
    for (let i = 0; i < 3; i++) {
        const start = points[i];
        const end = points[(i + 1) % 3];
        
        if (lineCircleIntersection(start, end, circle)) {
            return true;
        }
    }
    
    return false;
}

// Check if point is inside triangle
function pointInTriangle(x, y, points) {
    const [p1, p2, p3] = points;
    
    // Calculate area of the triangle
    const totalArea = triangleArea(p1, p2, p3);
    
    // Calculate areas of three triangles formed by the point and each side of the triangle
    const area1 = triangleArea({x, y}, p1, p2);
    const area2 = triangleArea({x, y}, p2, p3);
    const area3 = triangleArea({x, y}, p3, p1);
    
    // Point is inside if the sum of the three areas equals the total area
    return Math.abs(totalArea - (area1 + area2 + area3)) < 0.1; // Use a small epsilon for floating point errors
}

// Calculate area of a triangle using the shoelace formula
function triangleArea(p1, p2, p3) {
    return Math.abs(
        (p1.x * (p2.y - p3.y) + 
         p2.x * (p3.y - p1.y) + 
         p3.x * (p1.y - p2.y)) / 2
    );
}

// Check if a line segment intersects with a circle
function lineCircleIntersection(p1, p2, circle) {
    // Vector from p1 to p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    // Length of the line segment
    const length = Math.sqrt(dx*dx + dy*dy);
    
    // Unit vector in the direction of the line
    const unitX = dx / length;
    const unitY = dy / length;
    
    // Vector from p1 to circle center
    const cx = circle.x - p1.x;
    const cy = circle.y - p1.y;
    
    // Project circle center onto the line
    const projectionLength = cx * unitX + cy * unitY;
    
    // Closest point on the line to the circle center
    let closestX, closestY;
    
    // Check if the projection falls outside the line segment
    if (projectionLength < 0) {
        closestX = p1.x;
        closestY = p1.y;
    } else if (projectionLength > length) {
        closestX = p2.x;
        closestY = p2.y;
    } else {
        // Projection falls on the line segment
        closestX = p1.x + unitX * projectionLength;
        closestY = p1.y + unitY * projectionLength;
    }
    
    // Calculate distance from closest point to circle center
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX*distanceX + distanceY*distanceY;
    
    // Circle intersects line if distance is less than or equal to radius
    return distanceSquared <= circle.radius * circle.radius;
}

// Circle-Rectangle collision detection
function circleRectCollision(circle, rect) {
    // Find the closest point on the rectangle to the circle
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate the distance between the circle's center and this closest point
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    
    // If the distance is less than the circle's radius, an intersection occurs
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circle.radius * circle.radius);
}