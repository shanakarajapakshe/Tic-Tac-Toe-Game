let currentPlayer = 'X';
let gameActive = false;
let singlePlayerMode = false;
let difficulty = 'easy'; 
const gameState = Array(9).fill(null);

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const board = document.getElementById('board');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart');
const singlePlayerBtn = document.getElementById('singlePlayer');
const multiPlayerBtn = document.getElementById('multiPlayer');

function checkWin() {
  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      combination.forEach(index => {
        const cell = board.querySelector(`[data-index="${index}"]`);
        cell.classList.add('winner');
      });
      return true;
    }
  }
  return false;
}

function checkDraw() {
  return gameState.every(cell => cell);
}

function handleCellClick(e) {
  const cellIndex = e.target.dataset.index;

  if (!gameActive || gameState[cellIndex]) return;

  gameState[cellIndex] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add('taken');

  if (checkWin()) {
    message.textContent = `Player ${currentPlayer} wins!`;
    gameActive = false;
    return;
  }

  if (checkDraw()) {
    message.textContent = 'It\'s a draw!';
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  message.textContent = singlePlayerMode && currentPlayer === 'O' ? 'Computer\'s turn' : `Player ${currentPlayer}\'s turn`;

  if (singlePlayerMode && currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
}

function computerMove() {
  let availableCells = gameState.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

  let moveIndex;

  if (difficulty === 'easy') {

    moveIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
  } else if (difficulty === 'medium') {

    moveIndex = mediumAI(availableCells);
  } else if (difficulty === 'hard') {
    moveIndex = hardAI(availableCells);
  }

  gameState[moveIndex] = 'O';
  const cell = board.querySelector(`[data-index="${moveIndex}"]`);
  cell.textContent = 'O';
  cell.classList.add('taken');

  if (checkWin()) {
    message.textContent = 'Computer wins!';
    gameActive = false;
    return;
  }

  if (checkDraw()) {
    message.textContent = 'It\'s a draw!';
    gameActive = false;
    return;
  }

  currentPlayer = 'X';
  message.textContent = `Player ${currentPlayer}\'s turn`;
}

function mediumAI(availableCells) {
  for (let i = 0; i < availableCells.length; i++) {
    const tempState = [...gameState];
    tempState[availableCells[i]] = 'O';
    if (checkWinState(tempState, 'O')) return availableCells[i];
    tempState[availableCells[i]] = 'X';
    if (checkWinState(tempState, 'X')) return availableCells[i];
  }
  return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function checkWinState(state, player) {
  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (state[a] === player && state[b] === player && state[c] === player) {
      return true;
    }
  }
  return false;
}

function hardAI(availableCells) {
  const bestMove = minimax(gameState, 'O');
  return bestMove.index;
}

function minimax(boardState, player) {
  const availableCells = boardState.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

  if (checkWinState(boardState, 'O')) return { score: 10 };
  if (checkWinState(boardState, 'X')) return { score: -10 };
  if (availableCells.length === 0) return { score: 0 };

  const moves = [];
  for (let i = 0; i < availableCells.length; i++) {
    const move = {};
    move.index = availableCells[i];
    boardState[availableCells[i]] = player;

    if (player === 'O') {
      const result = minimax(boardState, 'X');
      move.score = result.score;
    } else {
      const result = minimax(boardState, 'O');
      move.score = result.score;
    }

    boardState[availableCells[i]] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === 'O') {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }

  return bestMove;
}

function createBoard() {
  board.innerHTML = '';
  gameState.fill(null);

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
  }
}

function startGame(mode) {
  gameActive = true;
  singlePlayerMode = mode === 'singlePlayer';
  message.textContent = `Player ${currentPlayer}\'s turn`;

  if (singlePlayerMode) {
    document.getElementById('difficulty').style.display = 'block';
  } else {
    document.getElementById('difficulty').style.display = 'none';
  }

  createBoard();
}

singlePlayerBtn.addEventListener('click', () => startGame('singlePlayer'));
multiPlayerBtn.addEventListener('click', () => startGame('multiPlayer'));
restartBtn.addEventListener('click', createBoard);

document.getElementById('easy').addEventListener('click', () => { difficulty = 'easy'; startGame('singlePlayer'); });
document.getElementById('medium').addEventListener('click', () => { difficulty = 'medium'; startGame('singlePlayer'); });
document.getElementById('hard').addEventListener('click', () => { difficulty = 'hard'; startGame('singlePlayer'); });
