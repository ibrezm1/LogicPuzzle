# Mondrian Blocks - Spatial Logic Puzzle

A clean, premium, and highly responsive digital adaptation of the spatial logic board game, Mondrian Blocks. Pack all blocks on an 8x8 grid with zero empty cells and zero overlaps!

## Features

- **88 Deterministic Levels**: Ranging from beginner interlocks to extremely challenging spatial layouts.
- **Pre-Placed Clues**: Locked starter blocks are pre-placed and locked at their exact coordinates on load.
- **Modern CSS Grid Layout**: Placed blocks snap natively and align perfectly to the grid, avoiding pixel-offset bugs.
- **Sound Synthesis**: Audio feedback (snapping, locking, lifting, errors, and wins) synthesized dynamically using the Web Audio API.
- **Theme Toggling**: Dark mode and light mode support with fully flipped block contrast values.
- **Mobile & Tablet Friendly**: 
  - Prevents scrolling while dragging pieces using `touch-action: none`.
  - Shifts floating pieces upwards on touch inputs (60px float offset) to prevent your finger from blocking your view of the piece.

## Controls

- **Drag & Drop**: Drag blocks directly from the tray or board to place them.
- **Rotate**: Press **R** or **Right-Click** while dragging to rotate a block.
- **Flip**: Press **F** to horizontally flip a block.
- **Lift**: Click or tap any placed, unlocked block on the board to return it to the inventory tray.
- **Reset**: Reload the level back to its starter layout.
- **Hint**: Spans a single unplaced piece onto its exact correct solution location on the board.

## Technical Architecture

The codebase has been modularized for clean architecture and direct execution over the `file://` protocol (no CORS restriction issues):
- `index.html`: Holds the page skeleton structure, themes, and CSS layouts.
- `js/audio.js`: Synthesizes gameplay sounds.
- `js/levels.js`: Generates and manages the 88 game levels and matrix transformation mechanics.
- `js/game.js`: Drives the main game loop, inputs, progress tracking, and rendering loops.

## How to Play

Open `index.html` in any modern web browser to start playing instantly!
