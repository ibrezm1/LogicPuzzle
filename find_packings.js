const BOARD_SIZE = 8;

const BLOCKS = [
  { id: '3x4', w: 3, h: 4, area: 12 },
  { id: '2x5', w: 2, h: 5, area: 10 },
  { id: '3x3', w: 3, h: 3, area: 9 },
  { id: '2x4', w: 2, h: 4, area: 8 },
  { id: '2x3', w: 2, h: 3, area: 6 },
  { id: '1x5', w: 1, h: 5, area: 5 },
  { id: '2x2', w: 2, h: 2, area: 4 },
  { id: '1x4', w: 1, h: 4, area: 4 },
  { id: '1x3', w: 1, h: 3, area: 3 },
  { id: '1x2', w: 1, h: 2, area: 2 },
  { id: '1x1', w: 1, h: 1, area: 1 }
];

const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
const placements = [];
const solutions = [];

function canPlace(x, y, w, h) {
  if (x + w > BOARD_SIZE || y + h > BOARD_SIZE) return false;
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      if (board[r][c]) return false;
    }
  }
  return true;
}

function setPlacement(x, y, w, h, val) {
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      board[r][c] = val;
    }
  }
}

function solve(blockIdx) {
  if (blockIdx === BLOCKS.length) {
    solutions.push(JSON.parse(JSON.stringify(placements)));
    return solutions.length >= 10;
  }

  const block = BLOCKS[blockIdx];
  const orientations = [];
  orientations.push({ w: block.w, h: block.h });
  if (block.w !== block.h) {
    orientations.push({ w: block.h, h: block.w });
  }

  for (const orient of orientations) {
    for (let y = 0; y <= BOARD_SIZE - orient.h; y++) {
      for (let x = 0; x <= BOARD_SIZE - orient.w; x++) {
        if (canPlace(x, y, orient.w, orient.h)) {
          setPlacement(x, y, orient.w, orient.h, true);
          placements.push({ id: block.id, x, y, w: orient.w, h: orient.h });

          if (solve(blockIdx + 1)) return true;

          placements.pop();
          setPlacement(x, y, orient.w, orient.h, false);
        }
      }
    }
  }

  return false;
}

solve(0);

console.log(`Found ${solutions.length} solutions.`);
solutions.forEach((sol, i) => {
  console.log(`Solution ${i + 1}:`);
  console.log(JSON.stringify(sol));
  console.log('---');
});
