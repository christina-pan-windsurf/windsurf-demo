import { initRenderer, resizeCanvas, drawGame, drawMinimap, updateLeaderboard } from '../renderer.js';
import { gameState } from '../gameState.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    playerName: 'TestPlayer',
    camera: { x: 0, y: 0 },
    food: [],
    aiPlayers: []
  }
}));

jest.mock('../utils.js', () => ({
  getSize: jest.fn((score) => Math.sqrt(score) + 20),
  calculateCenterOfMass: jest.fn(() => ({ x: 100, y: 100 }))
}));

jest.mock('../config.js', () => ({
  WORLD_SIZE: 2000,
  COLORS: {
    PLAYER: '#008080',
    MINIMAP: {
      PLAYER: '#4CAF50',
      OTHER: 'rgba(255, 255, 255, 0.3)'
    }
  },
  FOOD_SIZE: 5
}));

describe('Renderer', () => {
  let mockCanvas, mockCtx, mockMinimapCanvas, mockMinimapCtx, mockScoreElement, mockLeaderboardContent;
  let canvasElements;

  beforeEach(() => {
    gameState.playerCells = [];
    gameState.food = [];
    gameState.aiPlayers = [];
    gameState.camera = { x: 0, y: 0 };

    mockCtx = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      fillStyle: '',
      save: jest.fn(),
      restore: jest.fn(),
      font: '',
      strokeStyle: '',
      lineWidth: 0,
      textAlign: '',
      textBaseline: '',
      strokeText: jest.fn(),
      fillText: jest.fn()
    };

    mockMinimapCtx = {
      fillStyle: '',
      fillRect: jest.fn(),
      strokeStyle: '',
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn()
    };

    mockCanvas = {
      getContext: jest.fn(() => mockCtx),
      width: 800,
      height: 600
    };

    mockMinimapCanvas = {
      getContext: jest.fn(() => mockMinimapCtx),
      width: 150,
      height: 150
    };

    mockScoreElement = {
      textContent: ''
    };

    mockLeaderboardContent = {
      innerHTML: ''
    };

    canvasElements = {
      gameCanvas: mockCanvas,
      minimapCanvas: mockMinimapCanvas,
      scoreElement: mockScoreElement,
      leaderboardContent: mockLeaderboardContent
    };

    global.window = {
      innerWidth: 800,
      innerHeight: 600
    };
  });

  describe('initRenderer', () => {
    test('initializes renderer with canvas elements', () => {
      initRenderer(canvasElements);

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockMinimapCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    test('calls resizeCanvas during initialization', () => {
      initRenderer(canvasElements);

      expect(mockCanvas.width).toBe(1024);
      expect(mockCanvas.height).toBe(768);
    });
  });

  describe('resizeCanvas', () => {
    test('sets canvas dimensions to window size', () => {
      initRenderer(canvasElements);
      
      global.window.innerWidth = 1024;
      global.window.innerHeight = 768;
      
      resizeCanvas();

      expect(mockCanvas.width).toBe(1024);
      expect(mockCanvas.height).toBe(768);
    });
  });

  describe('drawGame', () => {
    beforeEach(() => {
      initRenderer(canvasElements);
    });

    test('clears canvas before drawing', () => {
      drawGame();

      expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 1024, 768);
    });

    test('draws food items', () => {
      gameState.food = [
        { x: 100, y: 100, color: '#ff0000' },
        { x: 200, y: 200, color: '#00ff00' }
      ];

      drawGame();

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    test('draws AI players', () => {
      gameState.aiPlayers = [
        { x: 150, y: 150, score: 100, color: '#0000ff', name: 'AI1' }
      ];

      drawGame();

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    test('draws player cells', () => {
      gameState.playerCells = [
        { x: 300, y: 300, score: 200 }
      ];

      drawGame();

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    test('updates score display', () => {
      gameState.playerCells = [
        { score: 100 },
        { score: 200 }
      ];

      drawGame();

      expect(mockScoreElement.textContent).toBe('Score: 300');
    });

    test('handles empty player cells for score', () => {
      gameState.playerCells = [];

      drawGame();

      expect(mockScoreElement.textContent).toBe('Score: 0');
    });
  });

  describe('drawMinimap', () => {
    beforeEach(() => {
      initRenderer(canvasElements);
    });

    test('draws minimap background', () => {
      drawMinimap();

      expect(mockMinimapCtx.fillRect).toHaveBeenCalledWith(0, 0, 150, 150);
    });

    test('draws viewport rectangle', () => {
      gameState.camera = { x: 100, y: 100 };

      drawMinimap();

      expect(mockMinimapCtx.strokeRect).toHaveBeenCalled();
    });

    test('draws AI players on minimap', () => {
      gameState.aiPlayers = [
        { x: 500, y: 500, score: 100 }
      ];

      drawMinimap();

      expect(mockMinimapCtx.beginPath).toHaveBeenCalled();
      expect(mockMinimapCtx.arc).toHaveBeenCalled();
      expect(mockMinimapCtx.fill).toHaveBeenCalled();
    });

    test('draws player cells on minimap', () => {
      gameState.playerCells = [
        { x: 600, y: 600, score: 200 }
      ];

      drawMinimap();

      expect(mockMinimapCtx.beginPath).toHaveBeenCalled();
      expect(mockMinimapCtx.arc).toHaveBeenCalled();
      expect(mockMinimapCtx.fill).toHaveBeenCalled();
    });
  });

  describe('updateLeaderboard', () => {
    beforeEach(() => {
      initRenderer(canvasElements);
    });

    test('updates leaderboard with player and AI scores', () => {
      gameState.playerCells = [{ score: 300 }];
      gameState.aiPlayers = [
        { name: 'AI1', score: 200 },
        { name: 'AI2', score: 400 }
      ];
      gameState.playerName = 'TestPlayer';

      updateLeaderboard();

      expect(mockLeaderboardContent.innerHTML).toContain('TestPlayer');
      expect(mockLeaderboardContent.innerHTML).toContain('AI1');
      expect(mockLeaderboardContent.innerHTML).toContain('AI2');
      expect(mockLeaderboardContent.innerHTML).toContain('400');
      expect(mockLeaderboardContent.innerHTML).toContain('300');
      expect(mockLeaderboardContent.innerHTML).toContain('200');
    });

    test('sorts leaderboard by score descending', () => {
      gameState.playerCells = [{ score: 300 }];
      gameState.aiPlayers = [
        { name: 'AI1', score: 100 },
        { name: 'AI2', score: 500 }
      ];
      gameState.playerName = 'TestPlayer';

      updateLeaderboard();

      const innerHTML = mockLeaderboardContent.innerHTML;
      const ai2Index = innerHTML.indexOf('AI2');
      const playerIndex = innerHTML.indexOf('TestPlayer');
      const ai1Index = innerHTML.indexOf('AI1');

      expect(ai2Index).toBeLessThan(playerIndex);
      expect(playerIndex).toBeLessThan(ai1Index);
    });

    test('limits leaderboard to top 5 players', () => {
      gameState.playerCells = [{ score: 300 }];
      gameState.aiPlayers = [
        { name: 'AI1', score: 100 },
        { name: 'AI2', score: 200 },
        { name: 'AI3', score: 400 },
        { name: 'AI4', score: 500 },
        { name: 'AI5', score: 600 },
        { name: 'AI6', score: 50 }
      ];

      updateLeaderboard();

      const innerHTML = mockLeaderboardContent.innerHTML;
      expect(innerHTML).toContain('AI5');
      expect(innerHTML).toContain('AI4');
      expect(innerHTML).toContain('AI3');
      expect(innerHTML).toContain('TestPlayer');
      expect(innerHTML).toContain('AI2');
      expect(innerHTML).not.toContain('AI1');
      expect(innerHTML).not.toContain('AI6');
    });

    test('handles empty game state', () => {
      gameState.playerCells = [];
      gameState.aiPlayers = [];

      updateLeaderboard();

      expect(mockLeaderboardContent.innerHTML).toContain('TestPlayer');
      expect(mockLeaderboardContent.innerHTML).toContain('0');
    });
  });
});
