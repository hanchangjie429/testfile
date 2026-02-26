import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  randomFoodPosition,
  setDirection,
  tick,
} from '../src/gameLogic.js';

test('tick moves snake forward by one cell', () => {
  const state = {
    ...createInitialState({ gridSize: 10, seed: 1 }),
    snake: [
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
    ],
    direction: { x: 1, y: 0 },
    pendingDirection: { x: 1, y: 0 },
    food: { x: 0, y: 0 },
  };

  const next = tick(state);
  assert.deepEqual(next.snake, [
    { x: 5, y: 4 },
    { x: 4, y: 4 },
    { x: 3, y: 4 },
  ]);
  assert.equal(next.score, 0);
  assert.equal(next.gameOver, false);
});

test('eating food increases length and score', () => {
  const state = {
    ...createInitialState({ gridSize: 10, seed: 1 }),
    snake: [
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
    ],
    direction: { x: 1, y: 0 },
    pendingDirection: { x: 1, y: 0 },
    food: { x: 5, y: 4 },
  };

  const next = tick(state);
  assert.equal(next.snake.length, 4);
  assert.equal(next.score, 1);
  assert.equal(next.gameOver, false);
  assert.notDeepEqual(next.food, { x: 5, y: 4 });
});

test('wall collision sets game over', () => {
  const state = {
    ...createInitialState({ gridSize: 6, seed: 1 }),
    snake: [
      { x: 5, y: 2 },
      { x: 4, y: 2 },
      { x: 3, y: 2 },
    ],
    direction: { x: 1, y: 0 },
    pendingDirection: { x: 1, y: 0 },
    food: { x: 1, y: 1 },
  };

  const next = tick(state);
  assert.equal(next.gameOver, true);
});

test('self collision sets game over', () => {
  const state = {
    ...createInitialState({ gridSize: 8, seed: 1 }),
    snake: [
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 4 },
      { x: 3, y: 4 },
    ],
    direction: { x: 0, y: 1 },
    pendingDirection: { x: 1, y: 0 },
    food: { x: 0, y: 0 },
  };

  const next = tick(state);
  assert.equal(next.gameOver, true);
});

test('setDirection prevents immediate reverse direction', () => {
  const state = {
    ...createInitialState({ gridSize: 10, seed: 1 }),
    direction: { x: 1, y: 0 },
    pendingDirection: { x: 1, y: 0 },
  };

  const unchanged = setDirection(state, 'ArrowLeft');
  assert.equal(unchanged, state);

  const changed = setDirection(state, 'ArrowUp');
  assert.deepEqual(changed.pendingDirection, { x: 0, y: -1 });
});

test('randomFoodPosition returns null when grid is full', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];
  const food = randomFoodPosition(2, snake, () => 0);
  assert.equal(food, null);
});
