export const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
};

export function createRng(seed = Date.now()) {
  let state = seed >>> 0;
  return function next() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isOppositeDirection(current, next) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

export function randomFoodPosition(gridSize, snake, rng = Math.random) {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  const empty = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        empty.push({ x, y });
      }
    }
  }

  if (empty.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * empty.length);
  return empty[index];
}

export function createInitialState(options = {}) {
  const gridSize = options.gridSize ?? 20;
  const seed = options.seed;
  const rng = options.rng ?? (seed !== undefined ? createRng(seed) : Math.random);
  const center = Math.floor(gridSize / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    gridSize,
    snake,
    direction: { x: 1, y: 0 },
    pendingDirection: { x: 1, y: 0 },
    food: randomFoodPosition(gridSize, snake, rng),
    score: 0,
    gameOver: false,
    won: false,
    rng,
  };
}

export function setDirection(state, key) {
  const nextDirection = DIRECTIONS[key];
  if (!nextDirection || state.gameOver) {
    return state;
  }

  if (isOppositeDirection(state.direction, nextDirection)) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

function isOutOfBounds(position, gridSize) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}

export function tick(state) {
  if (state.gameOver || state.won) {
    return state;
  }

  const direction = state.pendingDirection;
  const nextHead = {
    x: state.snake[0].x + direction.x,
    y: state.snake[0].y + direction.y,
  };

  if (isOutOfBounds(nextHead, state.gridSize)) {
    return { ...state, direction, gameOver: true };
  }

  const grows = state.food && positionsEqual(nextHead, state.food);
  const bodyToCheck = grows ? state.snake : state.snake.slice(0, -1);
  const hitsBody = bodyToCheck.some((part) => positionsEqual(part, nextHead));

  if (hitsBody) {
    return { ...state, direction, gameOver: true };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!grows) {
    nextSnake.pop();
  }

  let nextFood = state.food;
  let nextScore = state.score;
  let won = false;

  if (grows) {
    nextScore += 1;
    nextFood = randomFoodPosition(state.gridSize, nextSnake, state.rng);
    won = nextFood === null;
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: nextFood,
    score: nextScore,
    won,
    gameOver: false,
  };
}
