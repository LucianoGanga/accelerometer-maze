// Drawing functions with enhanced visuals
function drawGame() {
    // Draw walls first
    for (const wall of maze.walls) {
        // Add a subtle gradient to walls
        const wallGradient = ctx.createLinearGradient(
            wall.x, wall.y, 
            wall.x, wall.y + wall.height
        );
        wallGradient.addColorStop(0, '#888888');
        wallGradient.addColorStop(0.5, '#aaaaaa');
        wallGradient.addColorStop(1, '#777777');
        
        ctx.fillStyle = wallGradient;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        
        // Add subtle highlight to wall edges
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    // Draw obstacles with enhanced visuals
    for (const obstacle of obstacles) {
        if (obstacle.update) {
            obstacle.update();
        }
        
        // Draw different obstacle types with more visual appeal
        switch(obstacle.type) {
            case 'spike':
                // Draw spikes with gradient and metallic look
                const spikeCount = 3;
                const spikeWidth = obstacle.width / spikeCount;
                
                for (let i = 0; i < spikeCount; i++) {
                    // Create a more dramatic gradient for spikes
                    const spikeGradient = ctx.createLinearGradient(
                        obstacle.x + i * spikeWidth, 
                        obstacle.y + obstacle.height,
                        obstacle.x + (i + 0.5) * spikeWidth, 
                        obstacle.y
                    );
                    spikeGradient.addColorStop(0, '#600');  // Dark red at base
                    spikeGradient.addColorStop(0.7, '#f00'); // Bright red near tip
                    spikeGradient.addColorStop(1, '#ff6666'); // Light red at tip
                    
                    ctx.fillStyle = spikeGradient;
                    ctx.beginPath();
                    ctx.moveTo(obstacle.x + i * spikeWidth, obstacle.y + obstacle.height);
                    ctx.lineTo(obstacle.x + (i + 0.5) * spikeWidth, obstacle.y);
                    ctx.lineTo(obstacle.x + (i + 1) * spikeWidth, obstacle.y + obstacle.height);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Add metallic edge highlight
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                
                // Add a warning pattern at the base
                ctx.fillStyle = '#000';
                ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 3, obstacle.width, 3);
                
                // Add a danger glow effect
                ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
                ctx.fillRect(obstacle.x - 5, obstacle.y - 5, obstacle.width + 10, obstacle.height + 10);
                ctx.shadowBlur = 0;
                break;
                
            case 'teleporter':
                // Draw portal with more dramatic glow effect and animated particles
                // Main portal gradient
                const portalGradient = ctx.createRadialGradient(
                    obstacle.x + obstacle.width/2,
                    obstacle.y + obstacle.height/2,
                    0,
                    obstacle.x + obstacle.width/2,
                    obstacle.y + obstacle.height/2,
                    obstacle.width/2
                );
                portalGradient.addColorStop(0, '#ffffff');
                portalGradient.addColorStop(0.3, '#dd00ff');
                portalGradient.addColorStop(0.6, '#9900ff');
                portalGradient.addColorStop(1, 'rgba(102, 0, 153, 0)');
                
                // Outer glow
                ctx.shadowColor = '#9900ff';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(
                    obstacle.x + obstacle.width/2,
                    obstacle.y + obstacle.height/2,
                    obstacle.width/2 * 0.85,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = portalGradient;
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Inner portal
                ctx.beginPath();
                ctx.arc(
                    obstacle.x + obstacle.width/2,
                    obstacle.y + obstacle.height/2,
                    obstacle.width/3,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fill();
                
                // Add swirling effect with animated rings
                const time = Date.now() / 1000;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(
                        obstacle.x + obstacle.width/2,
                        obstacle.y + obstacle.height/2,
                        obstacle.width/4 + i * 5,
                        time * (i+1) % (Math.PI * 2),
                        time * (i+1) % (Math.PI * 2) + Math.PI / 2
                    );
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                break;
                
            case 'ice':
                // Draw ice with crystalline appearance
                // Create base ice shape with gradient
                const iceGradient = ctx.createLinearGradient(
                    obstacle.x, obstacle.y,
                    obstacle.x + obstacle.width, obstacle.y + obstacle.height
                );
                iceGradient.addColorStop(0, 'rgba(200, 240, 255, 0.7)');
                iceGradient.addColorStop(0.5, 'rgba(150, 220, 255, 0.5)');
                iceGradient.addColorStop(1, 'rgba(100, 200, 255, 0.7)');
                
                ctx.fillStyle = iceGradient;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                // Add crystalline edges
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                // Add ice crystal patterns
                const crystalCount = 5;
                for (let i = 0; i < crystalCount; i++) {
                    // Random positions for crystals
                    const cx = obstacle.x + Math.random() * obstacle.width;
                    const cy = obstacle.y + Math.random() * obstacle.height;
                    const size = Math.random() * 10 + 5;
                    
                    // Draw crystal star shape
                    ctx.beginPath();
                    for (let j = 0; j < 6; j++) {
                        const angle = j * Math.PI / 3;
                        const x1 = cx + Math.cos(angle) * size;
                        const y1 = cy + Math.sin(angle) * size;
                        if (j === 0) {
                            ctx.moveTo(x1, y1);
                        } else {
                            ctx.lineTo(x1, y1);
                        }
                    }
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.fill();
                }
                
                // Add a subtle blue glow
                ctx.shadowColor = 'rgba(100, 200, 255, 0.7)';
                ctx.shadowBlur = 10;
                ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                ctx.shadowBlur = 0;
                break;
                
            case 'moving':
                // Draw moving obstacle with animated elements to show movement
                // Create gradient based on movement direction
                const direction = obstacle.vx > 0 ? 1 : -1;
                const movingGradient = ctx.createLinearGradient(
                    obstacle.x, obstacle.y,
                    obstacle.x + obstacle.width * direction, obstacle.y
                );
                movingGradient.addColorStop(0, '#ff6600');
                movingGradient.addColorStop(0.5, '#ff9955');
                movingGradient.addColorStop(1, '#ff6600');
                
                ctx.fillStyle = movingGradient;
                
                // Draw with rounded ends for smoother appearance
                ctx.beginPath();
                ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5);
                ctx.fill();
                
                // Add direction indicator with animated trail
                const trailLength = Math.abs(obstacle.vx) * 3;
                
                // Draw motion trail
                ctx.beginPath();
                if (direction > 0) {
                    // Moving right - trail on left
                    ctx.moveTo(obstacle.x, obstacle.y + obstacle.height/2);
                    ctx.lineTo(obstacle.x - trailLength, obstacle.y + obstacle.height/4);
                    ctx.lineTo(obstacle.x - trailLength, obstacle.y + obstacle.height*3/4);
                } else {
                    // Moving left - trail on right
                    ctx.moveTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height/2);
                    ctx.lineTo(obstacle.x + obstacle.width + trailLength, obstacle.y + obstacle.height/4);
                    ctx.lineTo(obstacle.x + obstacle.width + trailLength, obstacle.y + obstacle.height*3/4);
                }
                ctx.closePath();
                
                // Create fade effect for trail
                const trailGradient = ctx.createLinearGradient(
                    obstacle.x + (direction > 0 ? 0 : obstacle.width),
                    0,
                    obstacle.x + (direction > 0 ? -trailLength : obstacle.width + trailLength),
                    0
                );
                trailGradient.addColorStop(0, 'rgba(255, 102, 0, 0.8)');
                trailGradient.addColorStop(1, 'rgba(255, 102, 0, 0)');
                
                ctx.fillStyle = trailGradient;
                ctx.fill();
                
                // Add movement lines on the obstacle
                const lineCount = 3;
                const lineSpacing = obstacle.width / (lineCount + 1);
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 2;
                
                for (let i = 1; i <= lineCount; i++) {
                    const lineX = obstacle.x + lineSpacing * i;
                    ctx.beginPath();
                    ctx.moveTo(lineX, obstacle.y + 3);
                    ctx.lineTo(lineX, obstacle.y + obstacle.height - 3);
                    ctx.stroke();
                }
                
                // Add subtle glow
                ctx.shadowColor = 'rgba(255, 102, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.fillStyle = 'rgba(255, 102, 0, 0.2)';
                ctx.fillRect(obstacle.x - 5, obstacle.y - 5, obstacle.width + 10, obstacle.height + 5);
                ctx.shadowBlur = 0;
                break;
                
            default:
                // Default drawing for any other obstacles with basic enhancement
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
    
    // Draw exit with enhanced visibility and effects
    // First draw an animated outer glow
    const time = Date.now() / 1000;
    const glowSize = Math.sin(time * 2) * 5 + 25; // Pulsing effect
    
    const exitGlow = ctx.createRadialGradient(
        exit.x + exit.width/2,
        exit.y + exit.height/2,
        0,
        exit.x + exit.width/2,
        exit.y + exit.height/2,
        exit.width/2 + glowSize
    );
    exitGlow.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
    exitGlow.addColorStop(0.5, 'rgba(0, 255, 0, 0.4)');
    exitGlow.addColorStop(1, 'rgba(0, 255, 0, 0)');
    
    ctx.fillStyle = exitGlow;
    ctx.fillRect(
        exit.x - glowSize, 
        exit.y - glowSize, 
        exit.width + glowSize*2, 
        exit.height + glowSize*2
    );
    
    // Add a subtle shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    // Then draw the actual exit with gradient
    const exitGradient = ctx.createLinearGradient(
        exit.x, exit.y,
        exit.x, exit.y + exit.height
    );
    exitGradient.addColorStop(0, '#00ff00'); // Bright green at top
    exitGradient.addColorStop(0.5, '#00cc00'); // Medium green in middle
    exitGradient.addColorStop(1, '#00aa00'); // Darker green at bottom
    
    ctx.fillStyle = exitGradient;
    ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Add a "finishing line" pattern at the exit
    const stripeWidth = 10;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let x = exit.x; x < exit.x + exit.width; x += stripeWidth * 2) {
        ctx.fillRect(x, exit.y, stripeWidth, exit.height);
    }
    
    // Add an EXIT label with better styling
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('EXIT', exit.x + exit.width/2, exit.y + exit.height/2);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add directional arrows pointing to the exit (more visible)
    ctx.fillStyle = 'white';
    
    // Top arrow
    ctx.beginPath();
    ctx.moveTo(exit.x + exit.width/2, exit.y - 25);
    ctx.lineTo(exit.x + exit.width/2 - 15, exit.y - 10);
    ctx.lineTo(exit.x + exit.width/2 + 15, exit.y - 10);
    ctx.closePath();
    ctx.fill();
    
    // Side arrows if appropriate
    if (exit.x > canvas.width * 0.3) {
        // Left arrow
        ctx.beginPath();
        ctx.moveTo(exit.x - 25, exit.y + exit.height/2);
        ctx.lineTo(exit.x - 10, exit.y + exit.height/2 - 15);
        ctx.lineTo(exit.x - 10, exit.y + exit.height/2 + 15);
        ctx.closePath();
        ctx.fill();
    }
    
    if (exit.x + exit.width < canvas.width * 0.7) {
        // Right arrow
        ctx.beginPath();
        ctx.moveTo(exit.x + exit.width + 25, exit.y + exit.height/2);
        ctx.lineTo(exit.x + exit.width + 10, exit.y + exit.height/2 - 15);
        ctx.lineTo(exit.x + exit.width + 10, exit.y + exit.height/2 + 15);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw ball with enhanced visuals
    // Ball shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(
        ball.x, 
        ball.y + ball.radius * 0.9, 
        ball.radius * 0.8, 
        ball.radius * 0.3, 
        0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Main ball body
    const ballGradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3, 
        ball.y - ball.radius * 0.3, 
        0,
        ball.x, 
        ball.y, 
        ball.radius
    );
    ballGradient.addColorStop(0, '#ff7777');
    ballGradient.addColorStop(0.5, '#ff4444');
    ballGradient.addColorStop(1, '#cc0000');
    
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a shine effect to the ball
    const shineGradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.4, 
        ball.y - ball.radius * 0.4, 
        0,
        ball.x - ball.radius * 0.2, 
        ball.y - ball.radius * 0.2, 
        ball.radius * 0.8
    );
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    shineGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = shineGradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a subtle inner shadow/highlight 
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.stroke();
}

// Display level complete screen
function showLevelComplete() {
    // Play level complete sound
    playSound('levelComplete');
    
    // Display level complete message with enhanced styling
    const levelComplete = document.createElement('div');
    levelComplete.style.position = 'absolute';
    levelComplete.style.top = '50%';
    levelComplete.style.left = '50%';
    levelComplete.style.transform = 'translate(-50%, -50%)';
    levelComplete.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    levelComplete.style.color = 'white';
    levelComplete.style.padding = '30px';
    levelComplete.style.borderRadius = '15px';
    levelComplete.style.fontSize = '28px';
    levelComplete.style.textAlign = 'center';
    levelComplete.style.zIndex = '100';
    levelComplete.style.boxShadow = '0 0 20px rgba(0, 200, 0, 0.7)';
    levelComplete.style.border = '2px solid #00cc00';
    levelComplete.innerHTML = `
        <h2 style="color: #00ff00; margin-top: 0;">Level ${currentLevel} Complete!</h2>
        <p style="font-size: 22px;">Starting Level ${currentLevel + 1} in 2 seconds...</p>
        <div style="width: 100%; height: 10px; background-color: #333; margin-top: 20px; border-radius: 5px;">
            <div id="progress-bar" style="width: 0%; height: 100%; background-color: #00cc00; border-radius: 5px;"></div>
        </div>
    `;
    
    document.body.appendChild(levelComplete);
    
    // Animate the progress bar
    let progress = 0;
    const progressBar = levelComplete.querySelector('#progress-bar');
    const progressInterval = setInterval(() => {
        progress += 2;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }, 40);
    
    // Increment level
    currentLevel++;
    document.getElementById('levelInfo').textContent = `Level: ${currentLevel}`;
    
    // Remove message and continue after delay
    setTimeout(() => {
        document.body.removeChild(levelComplete);
        createMaze();
        resetBall();
        gameRunning = true;
        requestAnimationFrame(gameLoop);
    }, 2000);
}