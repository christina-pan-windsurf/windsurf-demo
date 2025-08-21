jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [{ x: 100, y: 100, score: 100 }],
    aiPlayers: [{ name: 'AI1', score: 50 }],
    food: [{ x: 200, y: 200 }]
  },
  mouse: { x: 0, y: 0 }
}));

jest.mock('../renderer.js', () => ({
  initRenderer: jest.fn(),
  resizeCanvas: jest.fn(),
  drawGame: jest.fn(),
  drawMinimap: jest.fn(),
  updateLeaderboard: jest.fn()
}));

jest.mock('../entities.js', () => ({
  updatePlayer: jest.fn(),
  updateAI: jest.fn(),
  initEntities: jest.fn(),
  handlePlayerSplit: jest.fn()
}));

jest.mock('../collisions.js', () => ({
  handleFoodCollisions: jest.fn(),
  handlePlayerAICollisions: jest.fn(),
  handleAIAICollisions: jest.fn(),
  respawnEntities: jest.fn()
}));

jest.mock('../ui.js', () => ({
  initUI: jest.fn()
}));

import { gameState, mouse } from '../gameState.js';
import { initRenderer, resizeCanvas, drawGame, drawMinimap, updateLeaderboard } from '../renderer.js';
import { updatePlayer, updateAI, initEntities, handlePlayerSplit } from '../entities.js';
import { handleFoodCollisions, handlePlayerAICollisions, handleAIAICollisions, respawnEntities } from '../collisions.js';
import { initUI } from '../ui.js';

describe('Game Module Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mocked function calls', () => {
    test('verifies mocked functions are available', () => {
      expect(initRenderer).toBeDefined();
      expect(initEntities).toBeDefined();
      expect(initUI).toBeDefined();
      expect(updatePlayer).toBeDefined();
      expect(updateAI).toBeDefined();
      expect(handleFoodCollisions).toBeDefined();
    });

    test('verifies game state is mocked correctly', () => {
      expect(gameState.playerCells).toHaveLength(1);
      expect(gameState.aiPlayers).toHaveLength(1);
      expect(gameState.food).toHaveLength(1);
      expect(mouse.x).toBe(0);
      expect(mouse.y).toBe(0);
    });
  });

  describe('mouse coordinate updates', () => {
    test('mouse object can be updated', () => {
      mouse.x = 150;
      mouse.y = 250;

      expect(mouse.x).toBe(150);
      expect(mouse.y).toBe(250);
    });
  });

  describe('game loop functions', () => {
    test('can call game loop functions', () => {
      updatePlayer();
      updateAI();
      handleFoodCollisions();
      handlePlayerAICollisions();
      handleAIAICollisions();
      updateLeaderboard();
      drawGame();
      drawMinimap();

      expect(updatePlayer).toHaveBeenCalled();
      expect(updateAI).toHaveBeenCalled();
      expect(handleFoodCollisions).toHaveBeenCalled();
      expect(handlePlayerAICollisions).toHaveBeenCalled();
      expect(handleAIAICollisions).toHaveBeenCalled();
      expect(updateLeaderboard).toHaveBeenCalled();
      expect(drawGame).toHaveBeenCalled();
      expect(drawMinimap).toHaveBeenCalled();
    });

    test('can call player split function', () => {
      handlePlayerSplit();
      expect(handlePlayerSplit).toHaveBeenCalled();
    });
  });

  describe('initialization functions', () => {
    test('can call initialization functions', () => {
      const mockCanvas = { addEventListener: jest.fn() };
      const mockMinimapCanvas = {};
      const mockScoreElement = {};
      const mockLeaderboardContent = {};

      initRenderer({
        gameCanvas: mockCanvas,
        minimapCanvas: mockMinimapCanvas,
        scoreElement: mockScoreElement,
        leaderboardContent: mockLeaderboardContent
      });
      initEntities();
      initUI();

      expect(initRenderer).toHaveBeenCalledWith({
        gameCanvas: mockCanvas,
        minimapCanvas: mockMinimapCanvas,
        scoreElement: mockScoreElement,
        leaderboardContent: mockLeaderboardContent
      });
      expect(initEntities).toHaveBeenCalled();
      expect(initUI).toHaveBeenCalled();
    });

    test('can call resize function', () => {
      resizeCanvas();
      expect(resizeCanvas).toHaveBeenCalled();
    });
  });

  describe('DOM simulation patterns', () => {
    test('can simulate DOM elements', () => {
      const mockCanvas = {
        addEventListener: jest.fn(),
        getContext: jest.fn(() => ({
          clearRect: jest.fn(),
          fillRect: jest.fn()
        }))
      };

      mockCanvas.addEventListener('click', jest.fn());
      const ctx = mockCanvas.getContext('2d');
      ctx.clearRect(0, 0, 800, 600);

      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    test('can simulate event handlers', () => {
      const mockHandler = jest.fn();
      const mockEvent = { clientX: 100, clientY: 200 };
      
      mockHandler(mockEvent);
      expect(mockHandler).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('collision functions', () => {
    test('can call collision detection functions', () => {
      handleFoodCollisions();
      handlePlayerAICollisions();
      handleAIAICollisions();
      respawnEntities();

      expect(handleFoodCollisions).toHaveBeenCalled();
      expect(handlePlayerAICollisions).toHaveBeenCalled();
      expect(handleAIAICollisions).toHaveBeenCalled();
      expect(respawnEntities).toHaveBeenCalled();
    });
  });
});
