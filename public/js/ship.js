// ASCII Ship Animation
// Frame-by-frame text animation for that demoscene feel

// Dynamic width based on container
let CANVAS_WIDTH = 80;
const CANVAS_HEIGHT = 10;

// The ship shape (will be placed at different x positions)
const ship = [
  "         |\\              ",
  "         |  \\            ",
  "         |    \\          ",
  "         |      \\        ",
  "  _______|________\\_     ",
  " /  o    |    o    o\\    ",
  "<____________________>   "
];

const shipWidth = 27;
const shipHeight = 7;

// Precompute ship interior bounds for each row (for proper occlusion)
const shipBounds = ship.map(row => {
  let left = -1, right = -1;
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== ' ') {
      if (left === -1) left = i;
      right = i;
    }
  }
  return { left, right };
});

// Lighthouse (fixed position in background)
const lighthouse = [
  "   *   ",
  "  [_]  ",
  "  | |  ",
  "  |_|  ",
  " /___\\ ",
  "~~~~~~~"
];

const lighthouseWidth = 7;
const lighthouseHeight = 6;

// Light beam patterns for rotation effect (8 directions)
const lightBeams = [
  "   *------",    // right
  "   *\\     ",   // right-down
  "   *      ",    // down (no visible beam)
  "  /*      ",    // left-down
  "--*       ",    // left
  "  \\*      ",   // left-up
  "   *      ",    // up (no visible beam)
  "   */     "     // right-up
];

// Calculate width from container
function updateCanvasWidth() {
  const el = document.getElementById('heroAscii');
  if (el) {
    // Measure actual character width by creating a test element
    const testSpan = document.createElement('span');
    testSpan.style.font = window.getComputedStyle(el).font;
    testSpan.style.visibility = 'hidden';
    testSpan.style.position = 'absolute';
    testSpan.textContent = 'M'.repeat(10);
    document.body.appendChild(testSpan);
    const charWidth = testSpan.offsetWidth / 10;
    document.body.removeChild(testSpan);

    const containerWidth = el.offsetWidth || el.parentElement?.offsetWidth || 680;
    CANVAS_WIDTH = Math.floor(containerWidth / charWidth) - 2; // -2 to ensure fit
    CANVAS_WIDTH = Math.max(40, Math.min(CANVAS_WIDTH, 120));
  }
}

// Wave patterns that cycle
const wavePatterns = [
  "~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.",
  ".~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~",
  "~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.",
  ".~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~"
];

// Star field that twinkles
const starChars = ['.', '*', '+', '·', '°'];
const starDim = [' ', '.', ' ', '·', ' '];

// Fixed star positions (generated once)
let starField = null;

function initStarField(width, rows) {
  starField = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let i = 0; i < width; i++) {
      // ~15% chance of star at each position
      if (Math.random() < 0.15) {
        row.push({
          char: starChars[Math.floor(Math.random() * starChars.length)],
          phase: Math.random() * Math.PI * 2, // random twinkle phase
          speed: 0.05 + Math.random() * 0.1    // random twinkle speed
        });
      } else {
        row.push(null);
      }
    }
    starField.push(row);
  }
}

// Generate a twinkling star field row
function generateStars(width, rowIndex, time) {
  // Initialize star field if needed or width changed
  if (!starField || starField[0]?.length !== width) {
    initStarField(width, 10);
  }

  const row = starField[rowIndex % starField.length];
  let stars = '';

  for (let i = 0; i < width; i++) {
    const star = row[i];
    if (star) {
      // Twinkle: use sine wave to fade between bright and dim
      const brightness = Math.sin(time * star.speed + star.phase);
      if (brightness > 0.3) {
        stars += star.char;
      } else if (brightness > -0.3) {
        stars += starDim[starChars.indexOf(star.char)] || '.';
      } else {
        stars += ' ';
      }
    } else {
      stars += ' ';
    }
  }
  return stars;
}

// Bob offsets for ship vertical position
const bobOffsets = [0, 0, -1, -1, 0, 0, 1, 1];


// Wrap text in a colored span
function colorSpan(text, colorClass) {
  if (!colorClass) return text;
  return `<span class="${colorClass}">${text}</span>`;
}

// Batch consecutive chars with same class into single spans
function batchSpans(chars, classes) {
  let result = '';
  let currentClass = classes[0];
  let currentChars = chars[0];

  for (let i = 1; i < chars.length; i++) {
    if (classes[i] === currentClass) {
      currentChars += chars[i];
    } else {
      result += currentClass ? colorSpan(currentChars, currentClass) : currentChars;
      currentClass = classes[i];
      currentChars = chars[i];
    }
  }
  result += currentClass ? colorSpan(currentChars, currentClass) : currentChars;
  return result;
}

function generateFrame(shipX, waveFrame, bobFrame, time) {
  const lines = [];
  const bob = bobOffsets[bobFrame % bobOffsets.length];

  // Lighthouse position (fixed on right side)
  const lighthouseX = CANVAS_WIDTH - 12;
  const lightRotation = Math.floor(time / 8) % 8;

  // Top star rows (3 rows of stars above ship area)
  for (let i = 0; i < 3; i++) {
    const starLine = generateStars(CANVAS_WIDTH, i, time);
    lines.push(colorSpan(starLine, 'ascii-stars'));
  }

  // Ship + lighthouse + waves area
  const beam = lightBeams[lightRotation];
  const totalRows = shipHeight + 5; // ship area + 3 wave rows
  const waveStartRow = shipHeight + 2; // waves start after ship area

  for (let row = 0; row < totalRows; row++) {
    const chars = [];
    const classes = [];
    const shipRow = row - 1 - bob; // -1 for padding, bob for vertical movement
    const lhRow = row - 1; // lighthouse starts 1 row down
    const waveRow = row - waveStartRow; // which wave row (0, 1, or 2)

    // Pre-compute wave pattern for this row
    let extendedWave = null;
    if (waveRow >= 0 && waveRow < 3) {
      const wavePattern = wavePatterns[(waveFrame + waveRow) % wavePatterns.length];
      extendedWave = wavePattern.repeat(Math.ceil(CANVAS_WIDTH / wavePattern.length));
    }

    for (let col = 0; col < CANVAS_WIDTH; col++) {
      const shipCol = col - shipX;
      const lhCol = col - lighthouseX;
      const beamCol = col - lighthouseX;

      let char = ' ';
      let charClass = '';

      // Layer 1: Waves (bottom background)
      if (extendedWave) {
        char = extendedWave[col] || '~';
        charClass = 'ascii-waves';
      }

      // Layer 2: Light beam (at lighthouse light level, row 0 of lighthouse)
      if (lhRow === 0 && beamCol >= 0 && beamCol < beam.length && beam[beamCol] !== ' ') {
        char = beam[beamCol];
        charClass = 'ascii-light';
      }
      // Layer 2: Lighthouse (background)
      else if (lhRow >= 0 && lhRow < lighthouseHeight &&
          lhCol >= 0 && lhCol < lighthouse[lhRow]?.length) {
        const lhChar = lighthouse[lhRow][lhCol];
        if (lhChar !== ' ') {
          char = lhChar;
          charClass = lhChar === '*' ? 'ascii-light' : 'ascii-lighthouse';
        }
      }

      // Layer 3: Ship (foreground - chars inside ship bounds block background)
      if (shipRow >= 0 && shipRow < shipHeight &&
          shipCol >= 0 && shipCol < ship[shipRow]?.length) {
        const bounds = shipBounds[shipRow];
        const isInsideShip = bounds.left !== -1 && shipCol >= bounds.left && shipCol <= bounds.right;

        if (isInsideShip) {
          const shipChar = ship[shipRow][shipCol];
          if (shipChar !== ' ') {
            char = shipChar;
            charClass = 'ascii-ship';
          } else {
            char = ' ';
            charClass = '';
          }
        }
      }

      chars.push(char);
      classes.push(charClass);
    }
    lines.push(batchSpans(chars, classes));
  }

  return lines.join('\n');
}

// Animation state
let shipX = -shipWidth;
let waveFrame = 0;
let bobFrame = 0;
let frameCount = 0;

function animate() {
  const asciiEl = document.getElementById('heroAscii');
  if (!asciiEl) return;

  // Update canvas width periodically
  if (frameCount % 60 === 0) {
    updateCanvasWidth();
  }

  // Update frame - pass frameCount for star twinkling
  asciiEl.innerHTML = generateFrame(shipX, waveFrame, bobFrame, frameCount);

  // Advance ship position
  frameCount++;
  if (frameCount % 3 === 0) {
    shipX++;
    if (shipX > CANVAS_WIDTH + 5) {
      shipX = -shipWidth - 5;
    }
  }

  // Advance wave animation
  if (frameCount % 4 === 0) {
    waveFrame++;
  }

  // Advance bob
  if (frameCount % 6 === 0) {
    bobFrame++;
  }

  requestAnimationFrame(animate);
}

// Start animation when DOM is ready
function init() {
  updateCanvasWidth();
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Update on resize
window.addEventListener('resize', updateCanvasWidth);
