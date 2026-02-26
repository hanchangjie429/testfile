import {
  GRID_SIZE,
  createInitialState,
  directionFromName,
  restartState,
  setDirection,
  step,
  togglePause,
} from './gameLogic.js';

const TICK_MS = 120;
const STORAGE_KEY_BEST_SCORE = 'snake_best_score';

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const statusEl = document.getElementById('status');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const startMenuEl = document.getElementById('startMenu');
const startBtn = document.getElementById('startBtn');
const gameOverModalEl = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const modalRestartBtn = document.getElementById('modalRestartBtn');
const touchBtns = Array.from(document.querySelectorAll('[data-dir]'));

let state = createInitialState();
let isStarted = false;
let bestScore = getBestScore();
let hasShownGameOverModal = false;

boardEl.style.setProperty('--grid-size', String(GRID_SIZE));
bestScoreEl.textContent = String(bestScore);

function getBestScore() {
  const raw = window.localStorage.getItem(STORAGE_KEY_BEST_SCORE);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
}

function updateBestScore(score) {
  if (score <= bestScore) {
    return;
  }
  bestScore = score;
  bestScoreEl.textContent = String(bestScore);
  window.localStorage.setItem(STORAGE_KEY_BEST_SCORE, String(bestScore));
}

function openGameOverModal() {
  finalScoreEl.textContent = String(state.score);
  gameOverModalEl.classList.add('modal--visible');
  gameOverModalEl.setAttribute('aria-hidden', 'false');
}

function closeGameOverModal() {
  gameOverModalEl.classList.remove('modal--visible');
  gameOverModalEl.setAttribute('aria-hidden', 'true');
}

function startGame() {
  isStarted = true;
  hasShownGameOverModal = false;
  startMenuEl.classList.remove('overlay--visible');
  closeGameOverModal();
  render();
}

function render() {
  scoreEl.textContent = String(state.score);
  bestScoreEl.textContent = String(bestScore);

  if (!isStarted) {
    statusEl.textContent = 'Ready';
    pauseBtn.disabled = true;
  } else if (state.gameOver) {
    statusEl.textContent = state.food === null ? 'You win' : 'Game over';
    pauseBtn.disabled = true;
  } else if (state.paused) {
    statusEl.textContent = 'Paused';
    pauseBtn.disabled = false;
  } else {
    statusEl.textContent = 'Running';
    pauseBtn.disabled = false;
  }

  pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';

  boardEl.textContent = '';

  if (state.food) {
    const food = document.createElement('div');
    food.className = 'cell food';
    food.style.gridColumn = String(state.food.x + 1);
    food.style.gridRow = String(state.food.y + 1);
    boardEl.appendChild(food);
  }

  for (let i = state.snake.length - 1; i >= 0; i -= 1) {
    const segment = state.snake[i];
    const part = document.createElement('div');
    part.className = i === 0 ? 'cell snake snake--head' : 'cell snake';
    part.style.gridColumn = String(segment.x + 1);
    part.style.gridRow = String(segment.y + 1);
    boardEl.appendChild(part);
  }
}

function applyDirection(name) {
  if (!isStarted || state.gameOver) {
    return;
  }
  const dir = directionFromName(name);
  state = setDirection(state, dir);
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  if (!isStarted) {
    return;
  }
  if (key === 'arrowup' || key === 'w') {
    event.preventDefault();
    applyDirection('up');
  } else if (key === 'arrowdown' || key === 's') {
    event.preventDefault();
    applyDirection('down');
  } else if (key === 'arrowleft' || key === 'a') {
    event.preventDefault();
    applyDirection('left');
  } else if (key === 'arrowright' || key === 'd') {
    event.preventDefault();
    applyDirection('right');
  } else if (key === ' ') {
    event.preventDefault();
    state = togglePause(state);
  } else if (key === 'enter' && state.gameOver) {
    event.preventDefault();
    state = restartState(state);
    startGame();
    render();
  }
}

pauseBtn.addEventListener('click', () => {
  if (!isStarted) {
    return;
  }
  state = togglePause(state);
  render();
});

restartBtn.addEventListener('click', () => {
  state = restartState(state);
  startGame();
  render();
});

startBtn.addEventListener('click', () => {
  startGame();
  render();
});

modalRestartBtn.addEventListener('click', () => {
  state = restartState(state);
  startGame();
  render();
});

touchBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    applyDirection(btn.dataset.dir);
  });
});

document.addEventListener('keydown', handleKeydown);

setInterval(() => {
  if (!isStarted) {
    return;
  }
  state = step(state);
  updateBestScore(state.score);
  if (state.gameOver && !hasShownGameOverModal) {
    hasShownGameOverModal = true;
    openGameOverModal();
  }
  render();
}, TICK_MS);

render();
