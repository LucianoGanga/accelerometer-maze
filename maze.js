// Maze generation and management
let maze;
let exit;

// Create maze with walls - proper single entry/exit path
function createMaze() {
    maze = {
        walls: [],
        wallWidth: Math.min(canvas.width, canvas.height) * 0.025
    };
    
    // Clear existing walls and obstacles
    maze.walls = [];
    obstacles = [];
    
    // Define the entry point at the top
    const entryWidth = maze.wallWidth * 3;
    const entryX = canvas.width / 2 - entryWidth / 2;
    
    // Create top wall with entry point
    maze.walls.push({
        x: 0,
        y: 0,
        width: entryX,
        height: maze.wallWidth,
        color: '#aaaaaa'
    });
    
    maze.walls.push({
        x: entryX + entryWidth,
        y: 0,
        width: canvas.width - (entryX + entryWidth),
        height: maze.wallWidth,
        color: '#aaaaaa'
    });
    
    // Create bottom wall with exit point (will be replaced by exit object)
    // Make exit wider and more visible
    const exitWidth = Math.max(maze.wallWidth * 4, canvas.width * 0.15);
    const exitX = canvas.width / 2 - exitWidth / 2;
    
    maze.walls.push({
        x: 0,
        y: canvas.height - maze.wallWidth,
        width: exitX,
        height: maze.wallWidth,
        color: '#aaaaaa'
    });
    
    maze.walls.push({
        x: exitX + exitWidth,
        y: canvas.height - maze.wallWidth,
        width: canvas.width - (exitX + exitWidth),
        height: maze.wallWidth,
        color: '#aaaaaa'
    });
    
    // Add left and right borders
    maze.walls.push({
        x: 0,
        y: 0,
        width: maze.wallWidth,
        height: canvas.height,
        color: '#aaaaaa'
    });
    
    maze.walls.push({
        x: canvas.width - maze.wallWidth,
        y: 0,
        width: maze.wallWidth,
        height: canvas.height,
        color: '#aaaaaa'
    });
    
    // Create internal maze structure based on level
    // Increase complexity with level
    const complexity = Math.min(8, Math.floor(2 + currentLevel * 0.5)); // Limit complexity but increase with level
    const rows = complexity;
    const cols = complexity;
    
    // Create a grid-based maze
    const cellWidth = (canvas.width - 2 * maze.wallWidth) / cols;
    const cellHeight = (canvas.height - 2 * maze.wallWidth) / rows;
    
    // Generate maze using a simplified recursive backtracking algorithm
    const grid = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = {
                visited: false,
                walls: {
                    top: true,
                    right: true,
                    bottom: true,
                    left: true
                }
            };
        }
    }
    
    // Create a path through the maze
    function carvePathFrom(r, c) {
        grid[r][c].visited = true;
        
        // Random order to check neighbors
        const directions = ["top", "right", "bottom", "left"];
        shuffleArray(directions);
        
        for (const direction of directions) {
            let nr = r, nc = c;
            
            if (direction === "top") nr--;
            else if (direction === "right") nc++;
            else if (direction === "bottom") nr++;
            else if (direction === "left") nc--;
            
            // Check if neighbor is valid and not visited
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].visited) {
                // Remove walls between current cell and neighbor
                if (direction === "top") {
                    grid[r][c].walls.top = false;
                    grid[nr][nc].walls.bottom = false;
                } else if (direction === "right") {
                    grid[r][c].walls.right = false;
                    grid[nr][nc].walls.left = false;
                } else if (direction === "bottom") {
                    grid[r][c].walls.bottom = false;
                    grid[nr][nc].walls.top = false;
                } else if (direction === "left") {
                    grid[r][c].walls.left = false;
                    grid[nr][nc].walls.right = false;
                }
                
                // Continue carving path from neighbor
                carvePathFrom(nr, nc);
            }
        }
    }
    
    // Ensure there's a clear path from top to bottom
    // Start at a random column in the top row
    const startCol = Math.floor(cols / 2); // Start in the middle to align with entry
    carvePathFrom(0, startCol);
    
    // Now ensure there's a path to the bottom
    let bottomRowConnected = false;
    for (let c = 0; c < cols; c++) {
        if (!grid[rows-1][c].walls.bottom) {
            bottomRowConnected = true;
            break;
        }
    }
    
    // If no connection to bottom, create one
    if (!bottomRowConnected) {
        const endCol = Math.floor(cols / 2); // End in the middle to align with exit
        grid[rows-1][endCol].walls.bottom = false;
    }
    
    // Add additional connections to make the maze more complex at higher levels
    // The higher the level, the more connections we add
    const additionalConnectionsCount = Math.floor(currentLevel * 0.7);
    for (let i = 0; i < additionalConnectionsCount; i++) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        const directions = ["top", "right", "bottom", "left"];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        let nr = r, nc = c;
        if (direction === "top") nr--;
        else if (direction === "right") nc++;
        else if (direction === "bottom") nr++;
        else if (direction === "left") nc--;
        
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (direction === "top") {
                grid[r][c].walls.top = false;
                grid[nr][nc].walls.bottom = false;
            } else if (direction === "right") {
                grid[r][c].walls.right = false;
                grid[nr][nc].walls.left = false;
            } else if (direction === "bottom") {
                grid[r][c].walls.bottom = false;
                grid[nr][nc].walls.top = false;
            } else if (direction === "left") {
                grid[r][c].walls.left = false;
                grid[nr][nc].walls.right = false;
            }
        }
    }
    
    // Convert grid to wall objects
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            const x = maze.wallWidth + c * cellWidth;
            const y = maze.wallWidth + r * cellHeight;
            
            // Add walls that still exist
            if (cell.walls.top) {
                maze.walls.push({
                    x: x,
                    y: y,
                    width: cellWidth,
                    height: maze.wallWidth,
                    color: '#aaaaaa'
                });
            }
            
            if (cell.walls.left) {
                maze.walls.push({
                    x: x,
                    y: y,
                    width: maze.wallWidth,
                    height: cellHeight,
                    color: '#aaaaaa'
                });
            }
            
            if (cell.walls.right && c === cols - 1) {
                maze.walls.push({
                    x: x + cellWidth - maze.wallWidth,
                    y: y,
                    width: maze.wallWidth,
                    height: cellHeight,
                    color: '#aaaaaa'
                });
            }
            
            if (cell.walls.bottom && r === rows - 1) {
                maze.walls.push({
                    x: x,
                    y: y + cellHeight - maze.wallWidth,
                    width: cellWidth,
                    height: maze.wallWidth,
                    color: '#aaaaaa'
                });
            }
        }
    }
    
    // Create exit
    exit = {
        x: exitX,
        y: canvas.height - maze.wallWidth * 3, // Move it up slightly for more visibility
        width: exitWidth,
        height: maze.wallWidth * 3,
        color: '#00ff00' // Brighter green
    };
    
    // Add obstacles based on level
    addObstacles(currentLevel, cellWidth, cellHeight);
    
    // Clear any obstacles near the exit to ensure it's accessible
    clearExitArea();
}

// Clear area around exit to ensure it's accessible
function clearExitArea() {
    const exitBuffer = 30;
    obstacles = obstacles.filter(obstacle => {
        return !(obstacle.x < exit.x + exit.width + exitBuffer &&
               obstacle.x + obstacle.width > exit.x - exitBuffer &&
               obstacle.y < exit.y + exit.height + exitBuffer &&
               obstacle.y + obstacle.height > exit.y - exitBuffer);
    });
}

// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Check if two rectangles intersect
function rectIntersect(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}