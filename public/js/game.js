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
    ctx.strokeStyle = '#21262d';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.beginPath();
            ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[row][col] ? '#22d3ee' : '#0d1117';
            ctx.fill();
            ctx.stroke();
        }
    }
}

function getNextGeneration(grid) {
    const nextGen = createGrid();
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const aliveNeighbors = countAliveNeighbors(grid, row, col);
            if (grid[row][col] === 1) {
                nextGen[row][col] = aliveNeighbors === 2 || aliveNeighbors === 3 ? 1 : 0;
            } else {
                nextGen[row][col] = aliveNeighbors === 3 ? 1 : 0;
            }
        }
    }
    return nextGen;
}

function countAliveNeighbors(grid, row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                count += grid[newRow][newCol];
            }
        }
    }
    return count;
}

function writeText(grid, text, startX, startY) {
    const fontSize = 5;  // Size of each character in cells
    const font = [
        // Patterns for characters (only basic letters and numbers)
        // Each character is 5x5 cells
        "     |     |     |     |     ",  // Space
        " XXX |X   X|X   X|X   X| XXX ",  // O
        "XXXX |X   X|X   X|X   X|XXXXX",  // D
        " XXX |X    | XXX |    X|XXXX ",  // S
        "X   X|X   X|XXXXX|X   X|X   X",  // H
        " XXX |  X  |  X  |  X  | XXX ",  // I
        " XXX |X   X|X   X|XXXX |X    ",  // P
        "     |     |  XX |  XX |     ",  // .
        "X   X|XX  X|X X X|X  XX|X   X",  // N
        " XXXX|X    |XXX  |X    | XXXX",  // E
        "XXXXX|  X  |  X  |  X  |  X  ",  // T
        // Add more characters as needed
    ];

    // Create a mapping for character patterns
    const charMap = {
        ' ': 0, 'O': 1, 'D': 2, 'S': 3, 'H': 4, 'I': 5, 'P': 6, '.': 7, 'N': 8, 'E': 9, 'T': 10
    };

    text = text.toUpperCase();
    const textLength = text.length * (fontSize + 1);
    const offsetX = Math.floor((cols - textLength) / 2);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (charMap[char] !== undefined) {
            const pattern = font[charMap[char]].split("|");
            for (let row = 0; row < fontSize; row++) {
                for (let col = 0; col < fontSize; col++) {
                    if (pattern[row][col] === 'X') {
                        grid[startY + row][offsetX + col + i * (fontSize + 1)] = 1;
                    }
                }
            }
        }
    }
}

function togglePlayPause() {
    if (isPlaying) {
        clearInterval(intervalId);
        playPauseButton.textContent = 'Play';
    } else {
        intervalId = setInterval(update, 100);
        playPauseButton.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
}

function resetGame() {
    clearInterval(intervalId);
    isPlaying = false;
    playPauseButton.textContent = 'Play';
    grid = createGrid();
    writeText(grid, "oddship.net", 2, Math.floor(rows / 2) - 2);
    drawGrid(grid);
}

function toggleCellState(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (grid[row][col] === 1) {
        grid[row][col] = 0;
    } else {
        grid[row][col] = 1;
    }
    drawGrid(grid);
}

// Initialize and start the game
function init() {
    writeText(grid, "oddship.net", 2, Math.floor(rows / 2) - 2);
    drawGrid(grid);
}

function update() {
    grid = getNextGeneration(grid);
    drawGrid(grid);
}

init();