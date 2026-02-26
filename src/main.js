import {
  createInitialState,
  setDirection,
  tick,
} from './gameLogic.js';

const board = document.querySelector('[data-board]');
const scoreEl = document.querySelector('[data-score]');
const statusEl = document.querySelector('[data-status]');
const restartBtn = document.querySelector('[data-restart]');
const controlButtons = document.querySelectorAll('[data-direction]');

const TICK_MS = 140;
let state = createInitialState({ gridSize: 20 });
let intervalId = null;

function toCellKey(position) {
  return `${position.x},${position.y}`;
}

function render() {
  board.innerHTML = '';
  board.style.setProperty('--grid-size', state.gridSize);

  const snakeParts = new Set(state.snake.map(toCellKey));
  const headKey = toCellKey(state.snake[0]);
  const foodKey = state.food ? toCellKey(state.food) : null;

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const cell = document.createElement('div');
      const key = `${x},${y}`;
      cell.className = 'cell';

      if (snakeParts.has(key)) {
        cell.classList.add('snake');
      }
      if (key === headKey) {
        cell.classList.add('head');
      }
      if (foodKey && key === foodKey) {
        cell.classList.add('food');
      }
      board.appendChild(cell);
    }
  }

  scoreEl.textContent = String(state.score);
  if (state.won) {
    statusEl.textContent = 'You win! Press restart to play again.';
  } else if (state.gameOver) {
    statusEl.textContent = 'Game over. Press restart to try again.';
  } else {
    statusEl.textContent = 'Use Arrow keys or WASD to move.';
  }
}

function startLoop() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => {
    state = tick(state);
    render();

    if (state.gameOver || state.won) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }, TICK_MS);
}

function restartGame() {
  state = createInitialState({ gridSize: state.gridSize });
  render();
  startLoop();
}

document.addEventListener('keydown', (event) => {
  const nextState = setDirection(state, event.key);
  if (nextState !== state) {
    state = nextState;
  }
});

restartBtn.addEventListener('click', restartGame);

controlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.getAttribute('data-direction');
    const nextState = setDirection(state, key);
    if (nextState !== state) {
      state = nextState;
    }
  });
});

render();
startLoop();
