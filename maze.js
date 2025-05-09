// Maze generation and management with consistent level designs
let maze;
let exit;

// Pseudo-random number generator with seed for consistent levels
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    // Simple random number generator that uses a seed
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
    
    // Get random number in range [min, max)
    range(min, max) {
        return min + this.random() * (max - min);
    }
    
    // Get random integer in range [min, max)
    rangeInt(min, max) {
        return Math.floor(this.range(min, max));
    }
    
    // Shuffle array deterministically - fixed to use iterative approach
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            // Swap elements directly
            const temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }
        return result;
    }
}

// Level configurations - predefined parameters for each level
const levelConfigs = [
    // Level 1 - Simple intro level, no obstacles
    {
        gridSize: 4,
        extraConnections: 0,
        obstacleCount: 0,
        obstacleTypes: [],
        exitWidth: 0.15,
        seed: 12345
    },
    // Level 2 - Introduce spikes
    {
        gridSize: 5,
        extraConnections: 1,
        obstacleCount: 3,
        obstacleTypes: ['spike'],
        exitWidth: 0.14,
        seed: 23456
    },
    // Level 3 - Introduce moving obstacles
    {
        gridSize: 5,
        extraConnections: 2,
        obstacleCount: 5,
        obstacleTypes: ['spike', 'moving'],
        exitWidth: 0.13,
        seed: 34567
    },
    // Level 4 - Introduce ice patches
    {
        gridSize: 6,
        extraConnections: 3,
        obstacleCount: 7,
        obstacleTypes: ['spike', 'moving', 'ice'],
        exitWidth: 0.12,
        seed: 45678
    },
    // Level 5 - Introduce teleporters
    {
        gridSize: 6,
        extraConnections: 4,
        obstacleCount: 9,
        obstacleTypes: ['spike', 'moving', 'ice', 'teleporter'],
        exitWidth: 0.11,
        seed: 56789
    },
    // Level 6 - Getting harder
    {
        gridSize: 7,
        extraConnections: 4,
        obstacleCount: 12,
        obstacleTypes: ['spike', 'moving', 'ice', 'teleporter'],
        exitWidth: 0.10,
        seed: 67890
    },
    // Level 7 - More complex
    {
        gridSize: 7,
        extraConnections: 5,
        obstacleCount: 15,
        obstacleTypes: ['spike', 'moving', 'ice', 'teleporter'],
        exitWidth: 0.09,
        seed: 78901
    },
    // Level 8 - Even harder
    {
        gridSize: 8,
        extraConnections: 6,
        obstacleCount: 18,
        obstacleTypes: ['spike', 'moving', 'ice', 'teleporter'],
        exitWidth: 0.08,
        seed: 89012
    },
    // Level 9+ - Maximum difficulty
    {
        gridSize: 8,
        extraConnections: 7,
        obstacleCount: 20,
        obstacleTypes: ['spike', 'moving', 'ice', 'teleporter'],
        exitWidth: 0.07,
        seed: 90123
    }
];

// Get configuration for current level
function getLevelConfig() {
    // Use the last config for any level beyond our defined levels
    const index = Math.min(currentLevel - 1, levelConfigs.length - 1);
    return levelConfigs[index];
}

// Create maze with walls - proper single entry/exit path
function createMaze() {
    // Get configuration for current level
    const config = getLevelConfig();
    
    // Create seeded random generator for consistent levels
    const random = new SeededRandom(config.seed + currentLevel);
    
    maze = {
        walls: [],
        wallWidth: Math.min(canvas.width, canvas.height) * 0.025
    };
    
    // Clear existing walls and obstacles
    maze.walls = [];
    obstacles = [];
    
    // Create the maze with the specified seed
    createMazeWithSeed(random, config);
    
    // Validate that exit is not blocked
    validateMazeExit();
    
    // Add obstacles based on level config
    addObstacles(config, random, maze.cellWidth, maze.cellHeight);
    
    // Clear any obstacles near the exit and entrance to ensure accessibility
    clearSafeZones();
}

// Create maze with specific seed - separated for reuse in validation
function createMazeWithSeed(random, config) {
    if (!config) {
        config = getLevelConfig();
    }
    
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
    // Make exit width based on level config
    const exitWidth = Math.max(maze.wallWidth * 3, canvas.width * config.exitWidth);
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
    
    // Create internal maze structure based on level config
    const rows = config.gridSize;
    const cols = config.gridSize;
    
    // Create a grid-based maze
    maze.cellWidth = (canvas.width - 2 * maze.wallWidth) / cols;
    maze.cellHeight = (canvas.height - 2 * maze.wallWidth) / rows;
    
    // Generate maze using a simplified iterative approach
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
    
    // Start at middle column in the top row for consistency
    const startCol = Math.floor(cols / 2);
    
    // Use iterative approach instead of recursive carvePathFrom
    // This part replaces the old recursive carvePathFrom function
    const stack = [{r: 0, c: startCol}];
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        grid[current.r][current.c].visited = true;
        
        // Get unvisited neighbors
        const unvisitedNeighbors = [];
        
        // Check all four directions
        const directions = ["top", "right", "bottom", "left"];
        const shuffledDirections = random.shuffle(directions);
        
        for (const direction of shuffledDirections) {
            let nr = current.r, nc = current.c;
            
            if (direction === "top") nr--;
            else if (direction === "right") nc++;
            else if (direction === "bottom") nr++;
            else if (direction === "left") nc--;
            
            // Check if neighbor is valid and not visited
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].visited) {
                unvisitedNeighbors.push({nr, nc, direction});
            }
        }
        
        if (unvisitedNeighbors.length > 0) {
            // Randomly choose a neighbor
            const randomIndex = Math.floor(random.random() * unvisitedNeighbors.length);
            const {nr, nc, direction} = unvisitedNeighbors[randomIndex];
            
            // Remove walls between current cell and chosen neighbor
            if (direction === "top") {
                grid[current.r][current.c].walls.top = false;
                grid[nr][nc].walls.bottom = false;
            } else if (direction === "right") {
                grid[current.r][current.c].walls.right = false;
                grid[nr][nc].walls.left = false;
            } else if (direction === "bottom") {
                grid[current.r][current.c].walls.bottom = false;
                grid[nr][nc].walls.top = false;
            } else if (direction === "left") {
                grid[current.r][current.c].walls.left = false;
                grid[nr][nc].walls.right = false;
            }
            
            // Push the neighbor to the stack
            stack.push({r: nr, c: nc});
        } else {
            // Backtrack
            stack.pop();
        }
    }
    
    // Now ensure there's a path to the bottom
    let bottomRowConnected = false;
    for (let c = 0; c < cols; c++) {
        if (!grid[rows-1][c].walls.bottom) {
            bottomRowConnected = true;
            break;
        }
    }
    
    // If no connection to bottom, create one at the middle
    if (!bottomRowConnected) {
        const endCol = Math.floor(cols / 2);
        grid[rows-1][endCol].walls.bottom = false;
    }
    
    // Add additional connections based on level config for extra complexity
    // Use our seeded random for consistent placement
    for (let i = 0; i < config.extraConnections; i++) {
        const r = random.rangeInt(0, rows);
        const c = random.rangeInt(0, cols);
        const directions = ["top", "right", "bottom", "left"];
        const direction = directions[random.rangeInt(0, directions.length)];
        
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
            const x = maze.wallWidth + c * maze.cellWidth;
            const y = maze.wallWidth + r * maze.cellHeight;
            
            // Add walls that still exist
            if (cell.walls.top) {
                maze.walls.push({
                    x: x,
                    y: y,
                    width: maze.cellWidth,
                    height: maze.wallWidth,
                    color: '#aaaaaa'
                });
            }
            
            if (cell.walls.left) {
                maze.walls.push({
                    x: x,
                    y: y,
                    width: maze.wallWidth,
                    height: maze.cellHeight,
                    color: '#aaaaaa'
                });
            }
            
            if (cell.walls.right && c === cols - 1) {
                maze.walls.push({
                    x: x + maze.cellWidth - maze.wallWidth,
                    y: y,
                    width: maze.wallWidth,
                    height: maze.cellHeight,
                    color: '#aaaaaa'
                });
            }
            
            if (cell.walls.bottom && r === rows - 1) {
                maze.walls.push({
                    x: x,
                    y: y + maze.cellHeight - maze.wallWidth,
                    width: maze.cellWidth,
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
}

// Fixed validateMazeExit function to prevent infinite recursion
function validateMazeExit() {
    // Find all walls that could potentially block the exit
    const exitBlockers = maze.walls.filter(wall => {
        // Check if this wall intersects with the exit
        return (
            wall.y < exit.y + exit.height &&
            wall.y + wall.height > exit.y &&
            wall.x < exit.x + exit.width &&
            wall.x + wall.width > exit.x
        );
    });
    
    // If any walls intersect with the exit, regenerate the maze with a modified seed
    if (exitBlockers.length > 0) {
        console.log("Detected invalid maze with blocked exit. Regenerating...");
        // Modify the seed to get a different layout
        const config = getLevelConfig();
        const newSeed = config.seed + 100 + currentLevel;
        
        // Create a new random generator with the modified seed
        const newRandom = new SeededRandom(newSeed);
        
        // Clear current maze and recreate with new seed
        maze.walls = [];
        obstacles = [];
        
        // Recreate the maze with the new seed
        createMazeWithSeed(newRandom, config);
        
        // Limit recursive validation to avoid stack overflow
        // Instead of recursively calling, we'll just check once more and exit if still invalid
        const stillBlocked = maze.walls.some(wall => (
            wall.y < exit.y + exit.height &&
            wall.y + wall.height > exit.y &&
            wall.x < exit.x + exit.width &&
            wall.x + wall.width > exit.x
        ));
        
        if (!stillBlocked) {
            // Now verify that there is a valid path from start to exit, but only if exit is not blocked
            verifyPathToExit();
        } else {
            // If still blocked, just modify the exit position slightly instead of recursive regeneration
            exit.y -= maze.wallWidth;
            console.log("Exit still blocked, adjusting exit position");
        }
    } else {
        // Now verify that there is a valid path from start to exit
        verifyPathToExit();
    }
}

// Fixed verifyPathToExit to prevent infinite recursion
function verifyPathToExit() {
    // Create a grid of cells to track what's been visited
    const cellSize = maze.wallWidth;
    const rows = Math.ceil(canvas.height / cellSize);
    const cols = Math.ceil(canvas.width / cellSize);
    
    const grid = Array(rows).fill().map(() => Array(cols).fill(false));
    
    // Mark cells containing walls as blocked
    for (const wall of maze.walls) {
        const startCol = Math.floor(wall.x / cellSize);
        const endCol = Math.ceil((wall.x + wall.width) / cellSize);
        const startRow = Math.floor(wall.y / cellSize);
        const endRow = Math.ceil((wall.y + wall.height) / cellSize);
        
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    grid[r][c] = true; // Mark as blocked
                }
            }
        }
    }
    
    // Start flood fill from the entry point
    const startX = Math.floor(canvas.width / 2 / cellSize);
    const startY = Math.floor(ball.radius * 2 / cellSize);
    const visited = Array(rows).fill().map(() => Array(cols).fill(false));
    
    // Queue for BFS
    const queue = [{x: startX, y: startY}];
    visited[startY][startX] = true;
    
    // Define exit area for checking
    const exitStartCol = Math.floor(exit.x / cellSize);
    const exitEndCol = Math.ceil((exit.x + exit.width) / cellSize);
    const exitStartRow = Math.floor(exit.y / cellSize);
    const exitEndRow = Math.ceil((exit.y + exit.height) / cellSize);
    
    let pathFound = false;
    
    // BFS to find path
    while (queue.length > 0) {
        const {x, y} = queue.shift();
        
        // Check if we've reached the exit
        if (y >= exitStartRow && y < exitEndRow && x >= exitStartCol && x < exitEndCol) {
            pathFound = true;
            break;
        }
        
        // Check all 4 directions
        const directions = [
            {dx: 1, dy: 0},
            {dx: -1, dy: 0},
            {dx: 0, dy: 1},
            {dx: 0, dy: -1}
        ];
        
        for (const {dx, dy} of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            // Check if in bounds and not visited or blocked
            if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && 
                !visited[newY][newX] && !grid[newY][newX]) {
                visited[newY][newX] = true;
                queue.push({x: newX, y: newY});
            }
        }
    }
    
    // If no path is found, create a direct path instead of recursively regenerating
    if (!pathFound) {
        console.log("No valid path to exit found. Creating a simple path...");
        
        // Instead of regenerating the entire maze, create a direct path to exit
        const startX = canvas.width / 2;
        const startY = ball.radius * 2;
        const endX = exit.x + exit.width / 2;
        const endY = exit.y;
        
        // Create a simple path from start to exit
        createDirectPath(startX, startY, endX, endY);
    }
}

// New function to create a direct path to the exit
function createDirectPath(startX, startY, endX, endY) {
    // Calculate path width based on ball size
    const pathWidth = ball.radius * 3;
    
    // Remove walls that block the path
    maze.walls = maze.walls.filter(wall => {
        // Check if wall is in our path
        if (isWallInPath(wall, startX, startY, endX, endY, pathWidth)) {
            return false; // Remove this wall
        }
        return true; // Keep this wall
    });
    
    console.log("Created direct path to exit");
}

// Helper function to determine if a wall blocks our path
function isWallInPath(wall, startX, startY, endX, endY, pathWidth) {
    // Get center of wall
    const wallCenterX = wall.x + wall.width / 2;
    const wallCenterY = wall.y + wall.height / 2;
    
    // Calculate distance from wall center to line segment from start to end
    const distance = distanceToLineSegment(
        wallCenterX, wallCenterY,
        startX, startY,
        endX, endY
    );
    
    // If distance is less than half path width plus half wall size, wall is in path
    return distance < (pathWidth / 2 + Math.max(wall.width, wall.height) / 2);
}

// Calculate distance from point to line segment
function distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) {
        param = dot / len_sq;
    }
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
}

// Clear areas around exit and entrance to ensure they're accessible
function clearSafeZones() {
    // Entry safe zone
    const entrySafeZone = {
        x: canvas.width / 2 - canvas.width * 0.15,
        y: 0,
        width: canvas.width * 0.3,
        height: canvas.height * 0.15
    };
    
    // Exit safe zone
    const exitSafeZone = {
        x: exit.x - 30,
        y: exit.y - 30,
        width: exit.width + 60,
        height: exit.height + 60
    };
    
    // Remove obstacles in safe zones
    obstacles = obstacles.filter(obstacle => {
        // Check if obstacle overlaps with entry safe zone
        const inEntrySafeZone = rectIntersect(obstacle, entrySafeZone);
        
        // Check if obstacle overlaps with exit safe zone
        const inExitSafeZone = rectIntersect(obstacle, exitSafeZone);
        
        // Keep obstacle only if it's not in either safe zone
        return !(inEntrySafeZone || inExitSafeZone);
    });
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
