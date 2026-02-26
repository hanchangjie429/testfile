export const GRID_SIZE = 20;

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function samePos(a, b) {
  return a.x === b.x && a.y === b.y;
}

function sameDir(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

function defaultRandomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive);
}

export function directionFromName(name) {
  return DIRS[name] ?? null;
}

export function placeFood(snake, randomInt = defaultRandomInt, gridSize = GRID_SIZE) {
  const occupied = new Set(snake.map((seg) => `${seg.x},${seg.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const idx = randomInt(freeCells.length);
  return freeCells[idx];
}

export function createInitialState(randomInt = defaultRandomInt, gridSize = GRID_SIZE) {
  const center = Math.floor(gridSize / 2);
  const snake = [{ x: center, y: center }];
  const direction = { ...DIRS.right };

  return {
    gridSize,
    snake,
    direction,
    nextDirection: direction,
    food: placeFood(snake, randomInt, gridSize),
    score: 0,
    gameOver: false,
    paused: false,
  };
}

export function setDirection(state, requestedDirection) {
  if (!requestedDirection || state.gameOver) {
    return state;
  }

  const next = { ...requestedDirection };
  const movingDirection = state.nextDirection ?? state.direction;
  if (state.snake.length > 1 && isOpposite(movingDirection, next)) {
    return state;
  }

  if (sameDir(movingDirection, next)) {
    return state;
  }

  return {
    ...state,
    nextDirection: next,
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }

  return {
    ...state,
    paused: !state.paused,
  };
}

export function restartState(state, randomInt = defaultRandomInt) {
  return createInitialState(randomInt, state.gridSize);
}

export function step(state, randomInt = defaultRandomInt) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.nextDirection ?? state.direction;
  const currentHead = state.snake[0];
  const nextHead = {
    x: currentHead.x + direction.x,
    y: currentHead.y + direction.y,
  };

  if (
    nextHead.x < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y < 0 ||
    nextHead.y >= state.gridSize
  ) {
    return {
      ...state,
      direction,
      gameOver: true,
      paused: false,
    };
  }

  const willEat = state.food && samePos(nextHead, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

  if (bodyToCheck.some((segment) => samePos(segment, nextHead))) {
    return {
      ...state,
      direction,
      gameOver: true,
      paused: false,
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  let nextScore = state.score;
  let nextFood = state.food;

  if (willEat) {
    nextScore += 1;
    nextFood = placeFood(nextSnake, randomInt, state.gridSize);
  } else {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    nextDirection: direction,
    food: nextFood,
    score: nextScore,
    gameOver: nextFood === null ? true : state.gameOver,
    paused: false,
  };
}
