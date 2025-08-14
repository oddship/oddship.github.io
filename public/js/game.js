const canvas = document.getElementById('gameOfLifeCanvas');
const ctx = canvas.getContext('2d');
const playPauseButton = document.getElementById('playPauseButton');
const resetButton = document.getElementById('resetButton');

const cellSize = 10;
const rows = canvas.height / cellSize;
const cols = canvas.width / cellSize;

let grid = createGrid();
let intervalId;
let isPlaying = false;

playPauseButton.addEventListener('click', togglePlayPause);
resetButton.addEventListener('click', resetGame);
canvas.addEventListener('click', toggleCellState);

function createGrid() {
    const grid = [];
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            grid[row][col] = 0;
        }
    }
    return grid;
}

function drawGrid(grid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.beginPath();
            ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[row][col] ? '#fefefe' : '#1a1a1a';
            ctx.fill();
            ctx.stroke();
        }
    }
}

function updateGrid() {
    const newGrid = createGrid();
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const liveNeighbors = countLiveNeighbors(grid, row, col);
            if (grid[row][col] === 1) {
                newGrid[row][col] = liveNeighbors === 2 || liveNeighbors === 3 ? 1 : 0;
            } else {
                newGrid[row][col] = liveNeighbors === 3 ? 1 : 0;
            }
        }
    }
    return newGrid;
}

function countLiveNeighbors(grid, row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const x = col + j;
            const y = row + i;
            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                count += grid[y][x];
            }
        }
    }
    return count;
}

function toggleCellState(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    grid[row][col] = grid[row][col] ? 0 : 1;
    drawGrid(grid);
}

function startGame() {
    intervalId = setInterval(() => {
        grid = updateGrid();
        drawGrid(grid);
    }, 100);
}

function stopGame() {
    clearInterval(intervalId);
}

function togglePlayPause() {
    if (isPlaying) {
        stopGame();
        playPauseButton.textContent = 'Play';
    } else {
        startGame();
        playPauseButton.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
}

function resetGame() {
    stopGame();
    grid = createGrid();
    drawGrid(grid);
    playPauseButton.textContent = 'Play';
    isPlaying = false;
}

// Initialize the grid and draw it for the first time
drawGrid(grid);
