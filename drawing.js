// Drawing functions
function drawGame() {
    // Draw walls first
    for (const wall of maze.walls) {
        ctx.fillStyle = wall.color;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    // Draw obstacles
    for (const obstacle of obstacles) {
        if (obstacle.update) {
            obstacle.update();
        }
        
        // Draw different obstacle types
        switch(obstacle.type) {
            case 'spike':
                // Draw triangular spikes
                ctx.fillStyle = obstacle.color;
                const spikeCount = 3;
                const spikeWidth = obstacle.width / spikeCount;
                
                for (let i = 0; i < spikeCount; i++) {
                    ctx.beginPath();
                    ctx.moveTo(obstacle.x + i * spikeWidth, obstacle.y + obstacle.height);
                    ctx.lineTo(obstacle.x + (i + 0.5) * spikeWidth, obstacle.y);
                    ctx.lineTo(obstacle.x + (i + 1) * spikeWidth, obstacle.y + obstacle.height);
                    ctx.closePath();
                    ctx.fill();
                }
                break;
                
            case 'teleporter':
                // Draw portal with glow effect
                const gradient = ctx.createRadialGradient(
                    obstacle.x + obstacle.width/2,
                    obstacle.y + obstacle.height/2,
                    0,
                    obstacle.x + obstacle.width/2,
                    obstacle.y + obstacle.height/2,
                    obstacle.width/2
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.4, obstacle.color);
                gradient.addColorStop(1, 'rgba(153, 0, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    obstacle.x + obstacle.width/2,
                    obstacle.y + obstacle.height/2,
                    obstacle.width/2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                break;
                
            case 'ice':
                // Draw ice with semi-transparent appearance
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                // Add shine lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(obstacle.x, obstacle.y);
                ctx.lineTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height * 0.3);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(obstacle.x + obstacle.width * 0.7, obstacle.y);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height * 0.3);
                ctx.stroke();
                break;
                
            case 'moving':
                // Draw with direction indicator
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                // Add arrow showing direction
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                const direction = obstacle.vx > 0 ? 1 : -1;
                
                ctx.beginPath();
                ctx.moveTo(
                    obstacle.x + obstacle.width/2 + direction * obstacle.width/4,
                    obstacle.y + obstacle.height/2
                );
                ctx.lineTo(
                    obstacle.x + obstacle.width/2 - direction * obstacle.width/4,
                    obstacle.y + obstacle.height/4
                );
                ctx.lineTo(
                    obstacle.x + obstacle.width/2 - direction * obstacle.width/4,
                    obstacle.y + obstacle.height*3/4
                );
                ctx.closePath();
                ctx.fill();
                break;
                
            default:
                // Default drawing for any other obstacles
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
    
    // Draw exit with enhanced visibility
    // First draw a glowing background
    const exitGlow = ctx.createRadialGradient(
        exit.x + exit.width/2,
        exit.y + exit.height/2,
        0,
        exit.x + exit.width/2,
        exit.y + exit.height/2,
        exit.width
    );
    exitGlow.addColorStop(0, 'rgba(0, 255, 0, 0.7)');
    exitGlow.addColorStop(1, 'rgba(0, 255, 0, 0)');
    
    ctx.fillStyle = exitGlow;
    ctx.fillRect(exit.x - exit.width/2, exit.y - exit.height/2, exit.width*2, exit.height*2);
    
    // Then draw the actual exit
    ctx.fillStyle = exit.color;
    ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
    
    // Add an EXIT label
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', exit.x + exit.width/2, exit.y + exit.height/2);
    
    // Add an arrow pointing to the exit
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(exit.x + exit.width/2, exit.y - 20);
    ctx.lineTo(exit.x + exit.width/2 - 10, exit.y - 5);
    ctx.lineTo(exit.x + exit.width/2 + 10, exit.y - 5);
    ctx.closePath();
    ctx.fill();
    
    // Draw ball
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a shine effect to the ball
    const gradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3, 
        ball.y - ball.radius * 0.3, 
        0,
        ball.x, 
        ball.y, 
        ball.radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Display level complete screen
function showLevelComplete() {
    // Play level complete sound
    playSound('levelComplete');
    
    // Display level complete message
    const levelComplete = document.createElement('div');
    levelComplete.style.position = 'absolute';
    levelComplete.style.top = '50%';
    levelComplete.style.left = '50%';
    levelComplete.style.transform = 'translate(-50%, -50%)';
    levelComplete.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    levelComplete.style.color = 'white';
    levelComplete.style.padding = '20px';
    levelComplete.style.borderRadius = '10px';
    levelComplete.style.fontSize = '24px';
    levelComplete.style.textAlign = 'center';
    levelComplete.style.zIndex = '100';
    levelComplete.innerHTML = `<p>Level ${currentLevel} Complete!</p><p>Starting Level ${currentLevel + 1}...</p>`;
    
    document.body.appendChild(levelComplete);
    
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