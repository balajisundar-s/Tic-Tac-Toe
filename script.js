const boardEl = document.getElementById('board');
const statusText = document.getElementById('status-text');
const resultText = document.getElementById('result-text');

let currentPlayer = 'X';
let board = Array(9).fill(null);
let gameMode = '';
let isGameOver = false;
let isPlayerTurn = true;
let isUserStarting = true; // Tracks whose turn to start in single-player
let userSymbol = 'X';
let aiSymbol = 'O';


const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function startGame(mode) {
  gameMode = mode;

  if (mode === 'single') {
    userSymbol = isUserStarting ? 'X' : 'O';
    aiSymbol = isUserStarting ? 'O' : 'X';
    currentPlayer = 'X';
    isPlayerTurn = (currentPlayer === userSymbol);
  } else {
    currentPlayer = 'X'; // ✅ Default starting player for two-player mode
  }

  resetGame();

document.getElementById('welcome-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');

  if (mode === 'single' && currentPlayer === aiSymbol) {
    setTimeout(computerMove, 200);
  }
}



function createBoard() {
  boardEl.innerHTML = '';
  board.forEach((val, idx) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = idx;
    cell.textContent = val || '';
    cell.addEventListener('click', handleMove);
    boardEl.appendChild(cell);
  });
}

function handleMove(e) {
  const idx = e.target.dataset.index;
  if (board[idx] || isGameOver) return;

  // Determine symbol to use based on mode
  let symbolToUse;

  if (gameMode === 'single') {
    if (!isPlayerTurn) return; // Prevent user from clicking during AI turn
    symbolToUse = userSymbol;
  } else {
    symbolToUse = currentPlayer; // In two-player, use current turn
  }

  makeMove(idx, symbolToUse);

  if (checkWin()) return endGame(`${symbolToUse} Wins`);
  if (board.every(cell => cell)) return endGame("It's a Draw");

  if (gameMode === 'single') {
    currentPlayer = aiSymbol;
    isPlayerTurn = false;
    updateStatus();
    setTimeout(computerMove, 500);
  } else {
    // Toggle turn in two-player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
  }
}



function makeMove(idx, player) {
  board[idx] = player;
  createBoard();
}

function updateStatus() {
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWin() {
  return winCombos.some(combo => {
    const [a,b,c] = combo;
    return board[a] && board[a] === board[b] && board[b] === board[c];
  });
}

function endGame(message) {
  isGameOver = true;
  resultText.textContent = message;
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('end-screen').classList.add('active');
}

function resetGame() {
  board = Array(9).fill(null);
  isGameOver = false;
  currentPlayer = 'X';
  isPlayerTurn = true;
  updateStatus();
  createBoard();
}

function replayGame() {
document.getElementById('end-screen').classList.remove('active');

  if (gameMode === 'single') {
    isUserStarting = !isUserStarting; // Flip for next game
  }
  startGame(gameMode); // Use updated isUserStarting
}


function goHome() {
  isUserStarting = true; // Reset alternation
  document.getElementById('end-screen').classList.remove('active');
  document.getElementById('welcome-screen').classList.add('active');
}

function computerMove() {
  const bestMove = getBestMoveMinimax();
  makeMove(bestMove, aiSymbol);
  if (checkWin()) return endGame(`${aiSymbol} Wins`);
  if (board.every(cell => cell)) return endGame("It's a Draw");

  currentPlayer = userSymbol;
  isPlayerTurn = true;
  updateStatus();
}


function getBestMoveMinimax() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = aiSymbol;
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  const winner = checkWinner(newBoard);
  if (winner !== null) {
    return winner === aiSymbol ? 10 - depth :
           winner === userSymbol ? depth - 10 : 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (!newBoard[i]) {
        newBoard[i] = aiSymbol;
        best = Math.max(best, minimax(newBoard, depth + 1, false));
        newBoard[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (!newBoard[i]) {
        newBoard[i] = userSymbol;
        best = Math.min(best, minimax(newBoard, depth + 1, true));
        newBoard[i] = null;
      }
    }
    return best;
  }
}

function checkWinner(b) {
  for (const [a, b1, c] of winCombos) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  if (b.every(cell => cell)) return 'draw';
  return null;
}

