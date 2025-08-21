import { initRenderer, resizeCanvas, drawGame, drawMinimap, updateLeaderboard } from '../renderer.js';
import { gameState } from '../gameState.js';
import { getSize, calculateCenterOfMass } from '../utils.js';
import { WORLD_SIZE, COLORS, FOOD_SIZE } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
    gameState: {
        playerCells: [],
        aiPlayers: [],
        food: [],
        camera: { x: 0, y: 0 },
        playerName: 'TestPlayer'
    }
}));

jest.mock('../utils.js', () => ({
    getSize: jest.fn(),
    calculateCenterOfMass: jest.fn()
}));

describe('Renderer', () => {
    let mockCanvas, mockCtx, mockMinimapCanvas, mockMinimapCtx, mockScoreElement, mockLeaderboardContent;
    let canvasElements;

    beforeEach(() => {
        gameState.playerCells = [];
        gameState.aiPlayers = [];
        gameState.food = [];
        gameState.camera = { x: 0, y: 0 };
        gameState.playerName = 'TestPlayer';

        mockCtx = {
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            strokeRect: jest.fn(),
            getContext: jest.fn()
        };

        mockMinimapCtx = {
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn()
        };

        mockCanvas = {
            getContext: jest.fn().mockReturnValue(mockCtx),
            width: 800,
            height: 600
        };

        mockMinimapCanvas = {
            getContext: jest.fn().mockReturnValue(mockMinimapCtx)
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

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 768
        });

        jest.clearAllMocks();
        getSize.mockReturnValue(25);
        calculateCenterOfMass.mockReturnValue({ x: 400, y: 300 });
    });

    describe('initRenderer', () => {
        test('initializes renderer with canvas elements', () => {
            initRenderer(canvasElements);

            expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
            expect(mockMinimapCanvas.getContext).toHaveBeenCalledWith('2d');
        });

        test('sets canvas dimensions on initialization', () => {
            initRenderer(canvasElements);

            expect(mockCanvas.width).toBe(window.innerWidth);
            expect(mockCanvas.height).toBe(window.innerHeight);
        });
    });

    describe('resizeCanvas', () => {
        test('updates canvas dimensions to window size', () => {
            initRenderer(canvasElements);

            window.innerWidth = 1200;
            window.innerHeight = 900;

            resizeCanvas();

            expect(mockCanvas.width).toBe(1200);
            expect(mockCanvas.height).toBe(900);
        });
    });

    describe('drawGame', () => {
        beforeEach(() => {
            initRenderer(canvasElements);
        });

        test('clears canvas before drawing', () => {
            drawGame();

            expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
        });

        test('updates camera to follow player center of mass', () => {
            const mockCenter = { x: 500, y: 400 };
            calculateCenterOfMass.mockReturnValue(mockCenter);

            drawGame();

            expect(calculateCenterOfMass).toHaveBeenCalledWith(gameState.playerCells);
            expect(gameState.camera.x).toBe(mockCenter.x - mockCanvas.width / 2);
            expect(gameState.camera.y).toBe(mockCenter.y - mockCanvas.height / 2);
        });

        test('draws food items within screen bounds', () => {
            gameState.food = [
                { x: 100, y: 100, color: '#ff0000' },
                { x: 2000, y: 2000, color: '#00ff00' }  // Outside screen bounds
            ];

            drawGame();

            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        test('draws AI players within screen bounds', () => {
            gameState.aiPlayers = [
                { x: 200, y: 200, score: 100, color: '#0000ff', name: 'AI1' }
            ];
            getSize.mockReturnValue(30);

            drawGame();

            expect(getSize).toHaveBeenCalledWith(100);
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        test('draws player cells within screen bounds', () => {
            gameState.playerCells = [
                { x: 300, y: 300, score: 150 }
            ];
            getSize.mockReturnValue(35);

            drawGame();

            expect(getSize).toHaveBeenCalledWith(150);
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        test('updates score display with total player score', () => {
            gameState.playerCells = [
                { score: 100 },
                { score: 50 },
                { score: 75 }
            ];

            drawGame();

            expect(mockScoreElement.textContent).toBe('Score: 225');
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

        test('draws viewport rectangle on minimap', () => {
            gameState.camera = { x: 100, y: 100 };

            drawMinimap();

            expect(mockMinimapCtx.strokeRect).toHaveBeenCalled();
        });

        test('draws AI players on minimap', () => {
            gameState.aiPlayers = [
                { x: 500, y: 600 },
                { x: 1000, y: 1200 }
            ];

            drawMinimap();

            expect(mockMinimapCtx.beginPath).toHaveBeenCalledTimes(2);
            expect(mockMinimapCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockMinimapCtx.fill).toHaveBeenCalledTimes(2);
        });

        test('draws player cells on minimap', () => {
            gameState.playerCells = [
                { x: 400, y: 500 },
                { x: 800, y: 900 }
            ];

            drawMinimap();

            expect(mockMinimapCtx.beginPath).toHaveBeenCalledTimes(2);
            expect(mockMinimapCtx.arc).toHaveBeenCalledTimes(2);
            expect(mockMinimapCtx.fill).toHaveBeenCalledTimes(2);
        });
    });

    describe('updateLeaderboard', () => {
        beforeEach(() => {
            initRenderer(canvasElements);
        });

        test('calculates total player score correctly', () => {
            gameState.playerCells = [
                { score: 100 },
                { score: 200 },
                { score: 50 }
            ];
            gameState.aiPlayers = [
                { name: 'AI1', score: 150 }
            ];

            updateLeaderboard();

            expect(mockLeaderboardContent.innerHTML).toContain('350');
        });

        test('sorts players by score in descending order', () => {
            gameState.playerCells = [{ score: 200 }];
            gameState.aiPlayers = [
                { name: 'AI1', score: 300 },
                { name: 'AI2', score: 100 }
            ];

            updateLeaderboard();

            const innerHTML = mockLeaderboardContent.innerHTML;
            const ai1Position = innerHTML.indexOf('AI1');
            const playerPosition = innerHTML.indexOf('TestPlayer');
            const ai2Position = innerHTML.indexOf('AI2');

            expect(ai1Position).toBeLessThan(playerPosition);
            expect(playerPosition).toBeLessThan(ai2Position);
        });

        test('limits leaderboard to top 5 players', () => {
            gameState.playerCells = [{ score: 100 }];
            gameState.aiPlayers = [
                { name: 'AI1', score: 500 },
                { name: 'AI2', score: 400 },
                { name: 'AI3', score: 300 },
                { name: 'AI4', score: 200 },
                { name: 'AI5', score: 150 },
                { name: 'AI6', score: 50 }  // Should not appear
            ];

            updateLeaderboard();

            const innerHTML = mockLeaderboardContent.innerHTML;
            expect(innerHTML).toContain('AI1');
            expect(innerHTML).toContain('AI5');
            expect(innerHTML).not.toContain('AI6');
        });

        test('marks player name with special class', () => {
            gameState.playerCells = [{ score: 100 }];
            gameState.aiPlayers = [
                { name: 'AI1', score: 50 }
            ];

            updateLeaderboard();

            expect(mockLeaderboardContent.innerHTML).toContain('class="player-name"');
            expect(mockLeaderboardContent.innerHTML).toContain('TestPlayer');
        });

        test('handles empty game state gracefully', () => {
            gameState.playerCells = [];
            gameState.aiPlayers = [];

            updateLeaderboard();

            expect(mockLeaderboardContent.innerHTML).toContain('TestPlayer');
            expect(mockLeaderboardContent.innerHTML).toContain('0');
        });
    });
});
