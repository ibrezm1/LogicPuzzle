// Levels & Shapes Definitions & Generation
(function() {
  // 10 Solved Base Packings (Calculated using Backtracking Search)
  const BASE_PACKINGS = [
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 2, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 0, y: 7, w: 4, h: 1 },
      { id: '1x3', x: 4, y: 5, w: 1, h: 3 },
      { id: '1x2', x: 5, y: 7, w: 2, h: 1 },
      { id: '1x1', x: 2, y: 4, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 2, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 0, y: 7, w: 4, h: 1 },
      { id: '1x3', x: 4, y: 7, w: 3, h: 1 },
      { id: '1x2', x: 4, y: 5, w: 1, h: 2 },
      { id: '1x1', x: 2, y: 4, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 2, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 3, y: 7, w: 4, h: 1 },
      { id: '1x3', x: 0, y: 7, w: 3, h: 1 },
      { id: '1x2', x: 4, y: 5, w: 1, h: 2 },
      { id: '1x1', x: 2, y: 4, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 3, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 2, y: 4, w: 1, h: 4 },
      { id: '1x3', x: 3, y: 7, w: 3, h: 1 },
      { id: '1x2', x: 0, y: 7, w: 2, h: 1 },
      { id: '1x1', x: 6, y: 7, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 3, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 2, y: 4, w: 1, h: 4 },
      { id: '1x3', x: 4, y: 7, w: 3, h: 1 },
      { id: '1x2', x: 0, y: 7, w: 2, h: 1 },
      { id: '1x1', x: 3, y: 7, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 3, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 0, y: 7, w: 4, h: 1 },
      { id: '1x3', x: 2, y: 4, w: 1, h: 3 },
      { id: '1x2', x: 4, y: 7, w: 2, h: 1 },
      { id: '1x1', x: 6, y: 7, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 3, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 0, y: 7, w: 4, h: 1 },
      { id: '1x3', x: 2, y: 4, w: 1, h: 3 },
      { id: '1x2', x: 5, y: 7, w: 2, h: 1 },
      { id: '1x1', x: 4, y: 7, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 3, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 0, y: 7, w: 4, h: 1 },
      { id: '1x3', x: 4, y: 7, w: 3, h: 1 },
      { id: '1x2', x: 2, y: 4, w: 1, h: 2 },
      { id: '1x1', x: 2, y: 6, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 3, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 0, y: 7, w: 4, h: 1 },
      { id: '1x3', x: 4, y: 7, w: 3, h: 1 },
      { id: '1x2', x: 2, y: 5, w: 1, h: 2 },
      { id: '1x1', x: 2, y: 4, w: 1, h: 1 }
    ],
    [
      { id: '3x4', x: 0, y: 0, w: 3, h: 4 },
      { id: '2x5', x: 3, y: 0, w: 2, h: 5 },
      { id: '3x3', x: 5, y: 0, w: 3, h: 3 },
      { id: '2x4', x: 5, y: 3, w: 2, h: 4 },
      { id: '2x3', x: 0, y: 4, w: 2, h: 3 },
      { id: '1x5', x: 7, y: 3, w: 1, h: 5 },
      { id: '2x2', x: 3, y: 5, w: 2, h: 2 },
      { id: '1x4', x: 1, y: 7, w: 4, h: 1 },
      { id: '1x3', x: 2, y: 4, w: 1, h: 3 },
      { id: '1x2', x: 5, y: 7, w: 2, h: 1 },
      { id: '1x1', x: 0, y: 7, w: 1, h: 1 }
    ]
  ];

  // Colors mapping for visual identity (Mondrian signature color gradients)
  const PIECE_COLORS = {
    '3x4': 'from-red-650 to-red-800 bg-[#dc2626]',
    '2x5': 'from-blue-700 to-indigo-900 bg-[#1d4ed8]',
    '3x3': 'from-slate-50 to-slate-200 bg-[#f8fafc] text-slate-800 border-2 border-slate-350',
    '2x4': 'from-red-500 to-rose-600 bg-[#ef4444]',
    '2x3': 'from-cyan-500 to-blue-500 bg-[#06b6d4]',
    '1x5': 'from-yellow-400 to-amber-500 bg-[#eab308]',
    '2x2': 'from-pink-500 to-rose-500 bg-[#ec4899]',
    '1x4': 'from-violet-500 to-purple-600 bg-[#8b5cf6]',
    '1x3': 'from-blue-500 to-indigo-600 bg-[#3b82f6]',
    '1x2': 'from-emerald-500 to-teal-500 bg-[#10b981]',
    '1x1': 'from-orange-500 to-amber-500 bg-[#f97316]'
  };

  // Helper: Make empty matrix
  function createMatrix(w, h) {
    return Array(h).fill(null).map(() => Array(w).fill(1));
  }

  // Matrix helpers for rotation and flip
  function rotateMatrix(m) {
    const H = m.length;
    const W = m[0].length;
    const res = Array(W).fill(null).map(() => Array(H).fill(0));
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        res[c][H - 1 - r] = m[r][c];
      }
    }
    return res;
  }

  function flipMatrixHorizontal(m) {
    return m.map(row => [...row].reverse());
  }

  // Transform level solution coordinates
  function rotateCoords(x, y, w, h, angle) {
    if (angle === 90) return { x: 8 - y - h, y: x, w: h, h: w };
    if (angle === 180) return { x: 8 - x - w, y: 8 - y - h, w, h };
    if (angle === 270) return { x: y, y: 8 - x - w, w: h, h: w };
    return { x, y, w, h };
  }

  function flipCoords(x, y, w, h, horizontal) {
    if (horizontal) return { x: 8 - x - w, y, w, h };
    return { x, y, w, h };
  }

  const levels = [];
  function generateAllLevels() {
    // Level 1: Solution 1, no rot, no flip. Starters: 1x1, 1x2, 1x3, 1x4
    levels.push({
      id: 1,
      name: "Level 1: Beginner Gateway",
      starterIds: ['1x1', '1x2', '1x3', '1x4'],
      solution: JSON.parse(JSON.stringify(BASE_PACKINGS[0]))
    });

    // Level 2: Solution 4, no rot, no flip. Starters: 1x1, 1x2, 1x4, 2x2
    levels.push({
      id: 2,
      name: "Level 2: The Red Square",
      starterIds: ['1x1', '1x2', '1x4', '2x2'],
      solution: JSON.parse(JSON.stringify(BASE_PACKINGS[3]))
    });

    // Level 3: Solution 10, no rot, no flip. Starters: 1x1, 1x2, 1x3, 2x3
    levels.push({
      id: 3,
      name: "Level 3: Interlock Matrix",
      starterIds: ['1x1', '1x2', '1x3', '2x3'],
      solution: JSON.parse(JSON.stringify(BASE_PACKINGS[9]))
    });

    // Generate remaining levels 4-88 deterministically using transforms
    for (let i = 4; i <= 88; i++) {
      const packIdx = (i * 7) % 10;
      const basePack = BASE_PACKINGS[packIdx];
      
      // Transforms
      const rotAngle = ((i * 90) % 360);
      const horizFlip = (i % 2 === 0);
      
      // Transform the entire solution pack
      const transformedSolution = basePack.map(block => {
        let coords = { ...block };
        // Apply rotation
        coords = rotateCoords(coords.x, coords.y, coords.w, coords.h, rotAngle);
        // Apply flip
        coords = flipCoords(coords.x, coords.y, coords.w, coords.h, horizFlip);
        return { id: block.id, x: coords.x, y: coords.y, w: coords.w, h: coords.h };
      });

      // Determine starter pieces: pick 3 or 4 smaller pieces
      const startersAvailable = ['1x1', '1x2', '1x3', '1x4', '2x2', '2x3'];
      const numStarters = (i % 3 === 0) ? 3 : 4;
      const starterIds = [];
      let indexSelector = i;
      while (starterIds.length < numStarters) {
        const checkId = startersAvailable[indexSelector % startersAvailable.length];
        if (!starterIds.includes(checkId)) {
          starterIds.push(checkId);
        }
        indexSelector++;
      }

      levels.push({
        id: i,
        name: `Level ${i}: Challenge Grid`,
        starterIds,
        solution: transformedSolution
      });
    }
  }

  generateAllLevels();

  // Export globally
  window.GameLevels = {
    BASE_PACKINGS,
    PIECE_COLORS,
    createMatrix,
    rotateMatrix,
    flipMatrixHorizontal,
    levels
  };
})();
