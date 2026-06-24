// Game Main Core Logic & UI Bindings
(function() {
  const GameAudio = window.GameAudio;
  const GameLevels = window.GameLevels;

  // Game Core State
  let currentLevel = null;
  let inventoryPieces = [];
  let placedPieces = [];
  let selectedPiece = null;
  let activeLevelId = 1;
  let completedLevels = [];
  let timerInterval = null;
  let secondsElapsed = 0;
  let hintsUsed = 0;
  
  // Drag & Drop State
  let draggingPiece = null;
  let dragElement = null;
  let grabOffsetX = 0;
  let grabOffsetY = 0;
  let dragTouchOffset = 0;
  let snapX = null;
  let snapY = null;
  let touchMoving = false;

  // Load progress
  function loadProgress() {
    const saved = localStorage.getItem('mondrian_progress');
    if (saved) {
      try {
        completedLevels = JSON.parse(saved);
      } catch(e) {}
    }
    document.getElementById('comp-count').textContent = completedLevels.length;
  }

  function saveProgress(levelId) {
    if (!completedLevels.includes(levelId)) {
      completedLevels.push(levelId);
      localStorage.setItem('mondrian_progress', JSON.stringify(completedLevels));
    }
    document.getElementById('comp-count').textContent = completedLevels.length;
    populateLevelSelect();
  }

  // Populate Level Selector Dropdown
  function populateLevelSelect() {
    const select = document.getElementById('level-select');
    const prevVal = select.value;
    select.innerHTML = '';
    GameLevels.levels.forEach(lvl => {
      const opt = document.createElement('option');
      opt.value = lvl.id;
      const isDone = completedLevels.includes(lvl.id);
      opt.textContent = `${isDone ? '✓ ' : ''}${lvl.id}. ${lvl.name.substring(0, 18)}`;
      select.appendChild(opt);
    });
    if (prevVal) select.value = prevVal;
  }

  // Setup Board UI grid
  function initBoardUI() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    // Create 64 slots, explicitly placed in the grid layout to prevent pushing
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'border-[0.5px] border-slate-350 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/15 w-full h-full transition-all duration-300';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.style.gridColumn = `${c + 1}`;
        cell.style.gridRow = `${r + 1}`;
        board.appendChild(cell);
      }
    }

    // Append snap-preview as a child of the grid
    const previewEl = document.createElement('div');
    previewEl.id = 'snap-preview';
    previewEl.className = 'pointer-events-none border-2 border-dashed border-cyan-400 bg-cyan-500/25 rounded-md hidden shadow-glow-cyan z-30 transition-all duration-75 w-full h-full';
    board.appendChild(previewEl);
  }

  // Start Level
  function startLevel(levelId) {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    activeLevelId = parseInt(levelId);
    document.getElementById('level-select').value = activeLevelId;
    currentLevel = GameLevels.levels.find(l => l.id === activeLevelId);
    
    placedPieces = [];
    selectedPiece = null;
    hintsUsed = 0;
    updateControlsUI();
    updateHintButtonUI();

    // Create pieces list based on active level solution
    inventoryPieces = [];
    currentLevel.solution.forEach(sPiece => {
      const isStarter = currentLevel.starterIds.includes(sPiece.id);
      const color = isStarter 
        ? 'from-slate-750 to-slate-900 bg-slate-800' 
        : GameLevels.PIECE_COLORS[sPiece.id];

      const pieceObj = {
        id: sPiece.id,
        w: sPiece.w,
        h: sPiece.h,
        shape: GameLevels.createMatrix(sPiece.w, sPiece.h),
        isStarter,
        isLocked: isStarter, // Pre-lock starter pieces
        x: isStarter ? sPiece.x : null,
        y: isStarter ? sPiece.y : null,
        color
      };

      if (isStarter) {
        placedPieces.push(pieceObj);
      } else {
        inventoryPieces.push(pieceObj);
      }
    });

    renderInventory();
    renderBoardPlaced();
    updateBannerUI();
    
    // Start Timer
    timerInterval = setInterval(() => {
      secondsElapsed++;
    }, 1000);
  }

  // Render Inventory list
  function renderInventory() {
    const invEl = document.getElementById('inventory');
    invEl.innerHTML = '';
    
    const countEl = document.getElementById('inventory-count');
    const visiblePieces = inventoryPieces.filter(p => p.x === null);
    countEl.textContent = `${visiblePieces.length} Pieces`;

    if (visiblePieces.length === 0) {
      invEl.innerHTML = `
        <div class="col-span-2 text-center text-xs text-slate-500 dark:text-slate-500 py-6">
          Tray Empty
        </div>
      `;
      return;
    }

    visiblePieces.forEach(piece => {
      const pieceContainer = document.createElement('div');
      pieceContainer.className = 'flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-200/50 dark:bg-slate-800/40 border border-slate-350 dark:border-slate-750 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all active:scale-95 duration-200 shrink-0 w-24 h-24 lg:w-36 lg:h-32 select-none relative';
      pieceContainer.dataset.pieceId = piece.id;

      // Render mini-representation
      const grid = document.createElement('div');
      grid.className = 'grid gap-0.5 pointer-events-none';
      grid.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, minmax(0, 1fr))`;
      
      const cellSz = 14; // Small inventory cell size
      grid.style.width = (piece.shape[0].length * cellSz) + 'px';
      grid.style.height = (piece.shape.length * cellSz) + 'px';

      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[0].length; c++) {
          const cell = document.createElement('div');
          cell.className = `rounded-[3px] shadow-sm block-3d bg-gradient-to-br ${piece.color}`;
          grid.appendChild(cell);
        }
      }

      pieceContainer.appendChild(grid);

      // Selection highlight
      if (selectedPiece && selectedPiece.id === piece.id) {
        pieceContainer.classList.add('border-cyan-400', 'shadow-glow-cyan');
      }

      // Pointer event for dragging and tapping
      pieceContainer.addEventListener('pointerdown', (e) => onPointerDown(e, piece, false));
      
      invEl.appendChild(pieceContainer);
    });
  }

  // Refresh Placed Pieces on the Board
  function renderBoardPlaced() {
    // Clear previous placed pieces DOM elements
    document.querySelectorAll('.placed-piece-element').forEach(el => el.remove());
    
    const boardEl = document.getElementById('board');

    placedPieces.forEach(piece => {
      const pieceEl = document.createElement('div');
      pieceEl.dataset.pieceId = piece.id;
      
      if (piece.isLocked) {
        pieceEl.className = 'placed-piece-element block-3d-locked rounded-lg z-10 flex items-center justify-center select-none overflow-hidden cursor-not-allowed w-full h-full relative';
        pieceEl.classList.add(
          'bg-gradient-to-br',
          'from-slate-800', 'to-slate-900', 'bg-slate-850', 'border', 'border-slate-950',
          'dark:from-slate-200', 'dark:to-slate-100', 'dark:bg-slate-200', 'dark:border-slate-350',
          'opacity-95', 'shadow-md'
        );
      } else {
        pieceEl.className = 'placed-piece-element cursor-grab active:cursor-grabbing block-3d rounded-lg z-20 flex items-center justify-center transition-all select-none overflow-hidden w-full h-full relative';
        pieceEl.classList.add('bg-gradient-to-br', ...piece.color.split(' '));
      }

      // Position via CSS Grid
      pieceEl.style.gridColumn = `${piece.x + 1} / span ${piece.w}`;
      pieceEl.style.gridRow = `${piece.y + 1} / span ${piece.h}`;

      // Custom grid cells visually showing inside the piece
      const innerGrid = document.createElement('div');
      innerGrid.className = 'grid gap-0.5 w-full h-full p-[2px] pointer-events-none';
      innerGrid.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, minmax(0, 1fr))`;
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[0].length; c++) {
          const cell = document.createElement('div');
          cell.className = 'w-full h-full rounded-[4px] border border-white/5';
          innerGrid.appendChild(cell);
        }
      }
      pieceEl.appendChild(innerGrid);

      // Lock icon overlay for locked starters
      if (piece.isLocked) {
        const lock = document.createElement('div');
        lock.className = 'absolute inset-0 flex items-center justify-center bg-slate-950/20 dark:bg-white/10 text-white dark:text-slate-800 pointer-events-none';
        lock.innerHTML = `<i data-lucide="lock" class="w-5 h-5 drop-shadow-sm"></i>`;
        pieceEl.appendChild(lock);
      }

      // Active selection border
      if (selectedPiece && selectedPiece.id === piece.id) {
        pieceEl.classList.add('ring-2', 'ring-cyan-400', 'shadow-glow-cyan');
      }

      // Pointer event for dragging and lifting
      if (!piece.isLocked) {
        pieceEl.addEventListener('pointerdown', (e) => onPointerDown(e, piece, true));
      }

      boardEl.appendChild(pieceEl);
    });
    lucide.createIcons();
  }

  // Banner & Status Panel UI
  function updateBannerUI() {
    const title = document.getElementById('phase-title');
    const pulse = document.getElementById('phase-pulse');
    const dot = document.getElementById('phase-dot');

    title.textContent = "Solve Puzzle (Pack Colored Pieces)";
    title.className = "font-heading font-bold text-sm tracking-wide text-emerald-600 dark:text-green-400 uppercase";
    pulse.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75";
    dot.className = "relative inline-flex rounded-full h-3 w-3 bg-green-500";
  }

  // Piece Selection & Keyboard Controls Panel
  function selectPiece(piece) {
    selectedPiece = piece;
    updateControlsUI();
    renderInventory();
    renderBoardPlaced();
  }

  function updateControlsUI() {
    const noSelect = document.getElementById('no-selection-msg');
    const controls = document.getElementById('selection-controls');
    const name = document.getElementById('selected-piece-name');
    const status = document.getElementById('selected-piece-status');

    if (!selectedPiece) {
      noSelect.classList.remove('hidden');
      controls.classList.add('hidden');
    } else {
      noSelect.classList.add('hidden');
      controls.classList.remove('hidden');
      name.textContent = `${selectedPiece.w}x${selectedPiece.h} Block`;
      status.textContent = selectedPiece.x !== null ? 'On Board' : 'In Tray';
    }
  }

  function updateHintButtonUI() {
    const hintBtn = document.getElementById('hint-btn');
    if (!hintBtn) return;
    const remaining = 3 - hintsUsed;
    
    hintBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i> Get Hint (${remaining} left)`;
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    if (remaining <= 0) {
      hintBtn.disabled = true;
      hintBtn.className = 'flex-1 py-3 px-4 rounded-xl bg-cyan-600/5 border border-cyan-500/10 text-cyan-400/40 cursor-not-allowed font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all';
    } else {
      hintBtn.disabled = false;
      hintBtn.className = 'flex-1 py-3 px-4 rounded-xl bg-cyan-600/10 border border-cyan-500/30 hover:bg-cyan-600/20 text-cyan-400 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95';
    }
  }

  // Matrix Overlap Check (Generalized Exact Cover checking)
  function checkOverlap(piece, gridX, gridY) {
    const H = piece.shape.length;
    const W = piece.shape[0].length;

    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (piece.shape[r][c] === 1) {
          const boardX = gridX + c;
          const boardY = gridY + r;

          // Bounds check
          if (boardX < 0 || boardX >= 8 || boardY < 0 || boardY >= 8) {
            return true; // Overlap boundary (out of bounds)
          }

          // Check against other placed pieces
          for (const placed of placedPieces) {
            if (placed.id === piece.id) continue; // Skip self

            const placedH = placed.shape.length;
            const placedW = placed.shape[0].length;

            const relX = boardX - placed.x;
            const relY = boardY - placed.y;

            if (relX >= 0 && relX < placedW && relY >= 0 && relY < placedH) {
              if (placed.shape[relY][relX] === 1) {
                return true; // Collision!
              }
            }
          }
        }
      }
    }
    return false;
  }

  // Rotate active piece matrix
  function rotateActivePiece() {
    if (!selectedPiece || selectedPiece.isLocked) return;

    const isPlaced = selectedPiece.x !== null;
    const originalShape = selectedPiece.shape;
    const oldW = selectedPiece.w;
    const oldH = selectedPiece.h;

    // Perform rotation
    const rotated = GameLevels.rotateMatrix(originalShape);
    
    if (isPlaced) {
      // Temporarily apply rotation to test collision
      const tempPiece = { ...selectedPiece, shape: rotated, w: oldH, h: oldW };
      if (!checkOverlap(tempPiece, selectedPiece.x, selectedPiece.y)) {
        selectedPiece.shape = rotated;
        selectedPiece.w = oldH;
        selectedPiece.h = oldW;
        GameAudio.playSound('snap');
      } else {
        // If collision, pop piece back to inventory & rotate
        selectedPiece.shape = rotated;
        selectedPiece.w = oldH;
        selectedPiece.h = oldW;
        selectedPiece.x = null;
        selectedPiece.y = null;
        placedPieces = placedPieces.filter(p => p.id !== selectedPiece.id);
        GameAudio.playSound('error');
      }
    } else {
      selectedPiece.shape = rotated;
      selectedPiece.w = oldH;
      selectedPiece.h = oldW;
      GameAudio.playSound('pickup');
    }

    renderInventory();
    renderBoardPlaced();
    updateControlsUI();
  }

  // Flip active piece matrix
  function flipActivePiece() {
    if (!selectedPiece || selectedPiece.isLocked) return;

    const isPlaced = selectedPiece.x !== null;
    const originalShape = selectedPiece.shape;

    // Perform horizontal flip
    const flipped = GameLevels.flipMatrixHorizontal(originalShape);

    if (isPlaced) {
      const tempPiece = { ...selectedPiece, shape: flipped };
      if (!checkOverlap(tempPiece, selectedPiece.x, selectedPiece.y)) {
        selectedPiece.shape = flipped;
        GameAudio.playSound('snap');
      } else {
        // Collision: pop back to inventory
        selectedPiece.shape = flipped;
        selectedPiece.x = null;
        selectedPiece.y = null;
        placedPieces = placedPieces.filter(p => p.id !== selectedPiece.id);
        GameAudio.playSound('error');
      }
    } else {
      selectedPiece.shape = flipped;
      GameAudio.playSound('pickup');
    }

    renderInventory();
    renderBoardPlaced();
    updateControlsUI();
  }

  // Pointer Event Drag and Drop Engine
  function onPointerDown(e, piece, isLifting) {
    if (piece.isLocked) return;

    // Right-click handles rotation instead
    if (e.button === 2) {
      e.preventDefault();
      selectPiece(piece);
      rotateActivePiece();
      return;
    }

    e.preventDefault();
    selectPiece(piece);

    const boardEl = document.getElementById('board');
    const boardRect = boardEl.getBoundingClientRect();
    const cellSize = boardRect.width / 8;

    draggingPiece = piece;
    touchMoving = false;

    // Create floating drag element
    dragElement = document.createElement('div');
    dragElement.className = 'fixed pointer-events-none block-3d rounded-lg z-[9999] dragging-ghost overflow-hidden';
    dragElement.style.width = (piece.w * cellSize) + 'px';
    dragElement.style.height = (piece.h * cellSize) + 'px';
    
    dragElement.classList.add('bg-gradient-to-br', ...piece.color.split(' '));

    // Draw lines inside drag element
    const innerGrid = document.createElement('div');
    innerGrid.className = 'grid gap-0.5 w-full h-full p-[2px]';
    innerGrid.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, minmax(0, 1fr))`;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[0].length; c++) {
        const cell = document.createElement('div');
        cell.className = 'w-full h-full rounded-[4px] border border-white/5';
        innerGrid.appendChild(cell);
      }
    }
    dragElement.appendChild(innerGrid);

    // Check if dragging via touch
    const isTouch = e.pointerType === 'touch';
    dragTouchOffset = isTouch ? 60 : 0; // Float 60px above finger on touch devices

    // Center piece layout under pointer
    grabOffsetX = (piece.w * cellSize) / 2;
    grabOffsetY = (piece.h * cellSize) / 2;

    dragElement.style.left = (e.clientX - grabOffsetX) + 'px';
    dragElement.style.top = (e.clientY - grabOffsetY - dragTouchOffset) + 'px';
    document.body.appendChild(dragElement);

    // If dragging from the board, lift it
    if (isLifting) {
      placedPieces = placedPieces.filter(p => p.id !== piece.id);
      piece.x = null;
      piece.y = null;
      renderBoardPlaced();
    }

    GameAudio.playSound('pickup');

    // Hook global pointers
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!draggingPiece || !dragElement) return;
    touchMoving = true;

    // Update dragging element coordinate position
    dragElement.style.left = (e.clientX - grabOffsetX) + 'px';
    dragElement.style.top = (e.clientY - grabOffsetY - dragTouchOffset) + 'px';

    const boardEl = document.getElementById('board');
    const boardRect = boardEl.getBoundingClientRect();
    const cellSize = boardRect.width / 8;

    // Calculate relative board coords
    const relX = (e.clientX - grabOffsetX) - boardRect.left;
    const relY = (e.clientY - grabOffsetY - dragTouchOffset) - boardRect.top;

    // Find nearest grid snap cell
    const col = Math.round(relX / cellSize);
    const row = Math.round(relY / cellSize);

    // Verify bounds & overlap
    const isOverlap = checkOverlap(draggingPiece, col, row);

    const previewEl = document.getElementById('snap-preview');

    if (!isOverlap && col >= 0 && col + draggingPiece.w <= 8 && row >= 0 && row + draggingPiece.h <= 8) {
      snapX = col;
      snapY = row;

      // Show snap highlight preview in the grid
      previewEl.classList.remove('hidden');
      previewEl.style.gridColumn = `${col + 1} / span ${draggingPiece.w}`;
      previewEl.style.gridRow = `${row + 1} / span ${draggingPiece.h}`;
    } else {
      snapX = null;
      snapY = null;
      previewEl.classList.add('hidden');
    }
  }

  function onPointerUp(e) {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);

    if (!draggingPiece) return;

    const previewEl = document.getElementById('snap-preview');
    previewEl.classList.add('hidden');

    if (dragElement) {
      dragElement.remove();
      dragElement = null;
    }

    const p = draggingPiece;
    draggingPiece = null;

    // Check if dropped onto a valid snap coordinate slot
    if (snapX !== null && snapY !== null) {
      p.x = snapX;
      p.y = snapY;
      placedPieces.push(p);
      GameAudio.playSound('snap');

      // Check Win Condition (When all 11 pieces are placed)
      if (placedPieces.length === 11) {
        triggerWinCelebration();
      }
    } else {
      // Return to inventory
      p.x = null;
      p.y = null;
      if (touchMoving) {
        GameAudio.playSound('error');
      }
    }

    snapX = null;
    snapY = null;
    renderInventory();
    renderBoardPlaced();
    updateControlsUI();
  }

  // Win Celebration & Confetti particle system
  let confettiActive = false;
  let confettiParticles = [];
  const colorsList = ['#ff006e', '#8338ec', '#3b82f6', '#06d6a0', '#ffb703', '#e63946'];

  function triggerWinCelebration() {
    clearInterval(timerInterval);
    GameAudio.playSound('win');
    confettiActive = true;
    
    const canvas = document.getElementById('confetti-canvas');
    canvas.classList.remove('hidden');
    resizeCanvas();

    // Spawn initial particles
    for (let i = 0; i < 150; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colorsList[Math.floor(Math.random() * colorsList.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    requestAnimationFrame(drawConfetti);

    // Trigger Modal
    setTimeout(() => {
      const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
      const secs = (secondsElapsed % 60).toString().padStart(2, '0');
      document.getElementById('time-taken').textContent = `${mins}:${secs}`;
      document.getElementById('cleared-level-name').textContent = `Level ${activeLevelId}`;
      
      saveProgress(activeLevelId);

      document.getElementById('success-modal').classList.remove('hidden');
    }, 1000);
  }

  function resizeCanvas() {
    const canvas = document.getElementById('confetti-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawConfetti() {
    if (!confettiActive) return;
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiParticles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();

      // Wrap around
      if (p.y > canvas.height) {
        confettiParticles[idx] = {
          ...p,
          x: Math.random() * canvas.width,
          y: -20,
          tilt: Math.random() * 10 - 5
        };
      }
    });

    requestAnimationFrame(drawConfetti);
  }

  function stopConfetti() {
    confettiActive = false;
    confettiParticles = [];
    document.getElementById('confetti-canvas').classList.add('hidden');
  }

  // Hint feature
  function triggerHint() {
    if (hintsUsed >= 3) {
      GameAudio.playSound('error');
      return;
    }

    const nextPiece = inventoryPieces.find(p => p.x === null);
    if (nextPiece) {
      hintsUsed++;
      updateHintButtonUI();
      const solutionPos = currentLevel.solution.find(sol => sol.id === nextPiece.id);
      
      // Before placing, check if there is another piece already occupying its target coordinates
      const colliding = placedPieces.find(p => {
        return !(
          solutionPos.x + solutionPos.w <= p.x ||
          p.x + p.w <= solutionPos.x ||
          solutionPos.y + solutionPos.h <= p.y ||
          p.y + p.h <= solutionPos.y
        );
      });

      if (colliding && !colliding.isLocked) {
        colliding.x = null;
        colliding.y = null;
        placedPieces = placedPieces.filter(p => p.id !== colliding.id);
      }

      nextPiece.w = solutionPos.w;
      nextPiece.h = solutionPos.h;
      nextPiece.shape = GameLevels.createMatrix(solutionPos.w, solutionPos.h);
      nextPiece.x = solutionPos.x;
      nextPiece.y = solutionPos.y;
      placedPieces.push(nextPiece);
      GameAudio.playSound('snap');

      if (placedPieces.length === 11) {
        triggerWinCelebration();
      }

      renderInventory();
      renderBoardPlaced();
    }
  }

  // Context Menu Event (Right-click rotation)
  window.addEventListener('contextmenu', (e) => {
    if (e.target.closest('#board') || e.target.closest('#inventory') || e.target.closest('.dragging-ghost')) {
      e.preventDefault();
      if (selectedPiece) {
        rotateActivePiece();
      }
    }
  });

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      rotateActivePiece();
    } else if (e.key === 'f' || e.key === 'F') {
      flipActivePiece();
    }
  });

  // Theme toggler implementation
  document.getElementById('theme-btn').addEventListener('click', () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('mondrian_theme', 'light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('mondrian_theme', 'dark');
    }
    setTimeout(renderBoardPlaced, 100);
  });

  // Load initial theme settings
  const savedTheme = localStorage.getItem('mondrian_theme') || 'dark';
  document.documentElement.className = savedTheme;

  // Help Modal Toggle
  const helpModal = document.getElementById('help-modal');
  document.getElementById('help-btn').addEventListener('click', () => {
    helpModal.classList.remove('hidden');
  });
  document.getElementById('close-help-btn').addEventListener('click', () => {
    helpModal.classList.add('hidden');
  });
  document.getElementById('help-close-btn').addEventListener('click', () => {
    helpModal.classList.add('hidden');
  });

  // Success Modal buttons
  document.getElementById('success-retry-btn').addEventListener('click', () => {
    document.getElementById('success-modal').classList.add('hidden');
    stopConfetti();
    startLevel(activeLevelId);
  });

  document.getElementById('success-next-btn').addEventListener('click', () => {
    document.getElementById('success-modal').classList.add('hidden');
    stopConfetti();
    const nextId = activeLevelId < 88 ? activeLevelId + 1 : 1;
    startLevel(nextId);
  });

  // Level selector listener
  document.getElementById('level-select').addEventListener('change', (e) => {
    startLevel(e.target.value);
  });

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    startLevel(activeLevelId);
  });

  // Hint button
  document.getElementById('hint-btn').addEventListener('click', () => {
    triggerHint();
  });

  // Control Panel Action buttons
  document.getElementById('rotate-btn').addEventListener('click', rotateActivePiece);
  document.getElementById('flip-btn').addEventListener('click', flipActivePiece);

  // Mute sound toggle button
  document.getElementById('mute-btn').addEventListener('click', () => {
    const isMuted = GameAudio.toggleMute();
    const icon = document.querySelector('#mute-btn i');
    icon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
    lucide.createIcons();
  });

  // Click on board lifts placed piece back to tray
  document.getElementById('board').addEventListener('pointerdown', (e) => {
    const pieceEl = e.target.closest('.placed-piece-element');
    if (pieceEl) {
      const pieceId = pieceEl.dataset.pieceId;
      const p = placedPieces.find(item => item.id === pieceId);
      
      if (p && !p.isLocked) {
        e.stopPropagation();
        placedPieces = placedPieces.filter(item => item.id !== pieceId);
        p.x = null;
        p.y = null;
        selectPiece(p);
        GameAudio.playSound('pickup');
        renderBoardPlaced();
        renderInventory();
      }
    }
  });

  // Window resize handler to maintain board positions
  window.addEventListener('resize', () => {
    resizeCanvas();
    renderBoardPlaced();
  });

  // Initialize Game
  loadProgress();
  populateLevelSelect();
  initBoardUI();
  
  // Automatically trigger help modal on very first load
  if (!localStorage.getItem('mondrian_visited')) {
    helpModal.classList.remove('hidden');
    localStorage.setItem('mondrian_visited', 'true');
  }

  // Start very first level
  setTimeout(() => {
    startLevel(activeLevelId);
  }, 200);
})();
