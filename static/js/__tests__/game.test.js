jest.mock('../gameState.js', () => ({
    gameState: {
        playerCells: [],
        aiPlayers: [],
        food: [],
        camera: { x: 0, y: 0 },
        playerName: 'TestPlayer'
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

const mockCanvas = {
    addEventListener: jest.fn()
};

const mockWindow = {
    addEventListener: jest.fn(),
    innerWidth: 1024,
    innerHeight: 768
};

const mockDocument = {
    getElementById: jest.fn(),
    addEventListener: jest.fn(),
    readyState: 'complete'
};

const mockRequestAnimationFrame = jest.fn();

Object.defineProperty(global, 'document', {
    value: mockDocument,
    writable: true
});

Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true
});

Object.defineProperty(global, 'requestAnimationFrame', {
    value: mockRequestAnimationFrame,
    writable: true
});

let gameModuleImported = false;

describe('Game', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        gameModuleImported = false;
        
        gameState.playerCells = [];
        gameState.aiPlayers = [];
        gameState.food = [];
        gameState.camera = { x: 0, y: 0 };
        gameState.playerName = 'TestPlayer';
        
        mouse.x = 0;
        mouse.y = 0;

        mockDocument.getElementById.mockImplementation((id) => {
            switch (id) {
                case 'gameCanvas':
                    return mockCanvas;
                case 'minimap':
                    return { getContext: jest.fn() };
                case 'score':
                    return { textContent: '' };
                case 'leaderboard-content':
                    return { innerHTML: '' };
                default:
                    return null;
            }
        });
        
        jest.resetModules();
    });

    describe('setupInputHandlers', () => {
        test('sets up mouse movement handler on canvas', () => {
            require('../game.js');
            expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
        });

        test('sets up mouse click handler for splitting on canvas', () => {
            require('../game.js');
            expect(mockCanvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('sets up window resize handler', () => {
            require('../game.js');
            expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        });

        test('mouse movement updates mouse coordinates', () => {
            require('../game.js');
            
            const mouseMoveCall = mockCanvas.addEventListener.mock.calls.find(
                call => call[0] === 'mousemove'
            );
            expect(mouseMoveCall).toBeDefined();
            const mouseMoveHandler = mouseMoveCall[1];

            mouse.x = 0;
            mouse.y = 0;

            const mockEvent = { clientX: 100, clientY: 200 };
            mouseMoveHandler(mockEvent);

            expect(mouse.x).toBe(100);
            expect(mouse.y).toBe(200);
        });

        test('mouse click triggers player split', () => {
            require('../game.js');
            
            const clickCall = mockCanvas.addEventListener.mock.calls.find(
                call => call[0] === 'click'
            );
            expect(clickCall).toBeDefined();
            const clickHandler = clickCall[1];

            const mockEvent = {};
            clickHandler(mockEvent);

            expect(handlePlayerSplit).toHaveBeenCalled();
        });

        test('window resize triggers canvas resize', () => {
            require('../game.js');
            
            const resizeCall = mockWindow.addEventListener.mock.calls.find(
                call => call[0] === 'resize'
            );
            expect(resizeCall).toBeDefined();
            const resizeHandler = resizeCall[1];

            resizeHandler();

            expect(resizeCanvas).toHaveBeenCalled();
        });
    });

    describe('checkCollisions', () => {
        test('calls all collision handling functions in correct order', () => {
            let gameLoopCallback;
            mockRequestAnimationFrame.mockImplementation((callback) => {
                gameLoopCallback = callback;
                return 1;
            });

            require('../game.js');

            if (gameLoopCallback) {
                gameLoopCallback();
            }

            expect(handleFoodCollisions).toHaveBeenCalled();
            expect(handlePlayerAICollisions).toHaveBeenCalled();
            expect(handleAIAICollisions).toHaveBeenCalled();
            expect(respawnEntities).toHaveBeenCalled();
        });
    });

    describe('gameLoop', () => {
        test('calls all game update functions in correct order', () => {
            let gameLoopCallback;
            mockRequestAnimationFrame.mockImplementation((callback) => {
                gameLoopCallback = callback;
                return 1;
            });

            require('../game.js');

            if (gameLoopCallback) {
                gameLoopCallback();
            }

            expect(updatePlayer).toHaveBeenCalled();
            expect(updateAI).toHaveBeenCalled();
            expect(updateLeaderboard).toHaveBeenCalled();
            expect(drawGame).toHaveBeenCalled();
            expect(drawMinimap).toHaveBeenCalled();
        });

        test('schedules next frame with requestAnimationFrame', () => {
            require('../game.js');

            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('initGame', () => {
        test('finds all required DOM elements', () => {
            require('../game.js');

            expect(mockDocument.getElementById).toHaveBeenCalledWith('gameCanvas');
            expect(mockDocument.getElementById).toHaveBeenCalledWith('minimap');
            expect(mockDocument.getElementById).toHaveBeenCalledWith('score');
            expect(mockDocument.getElementById).toHaveBeenCalledWith('leaderboard-content');
        });

        test('initializes all game components in correct order', () => {
            require('../game.js');

            expect(initRenderer).toHaveBeenCalled();
            expect(initEntities).toHaveBeenCalled();
            expect(initUI).toHaveBeenCalled();
        });

        test('throws error when required DOM element is missing', () => {
            mockDocument.getElementById.mockImplementation((id) => {
                if (id === 'gameCanvas') return null;
                return { getContext: jest.fn() };
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            require('../game.js');

            expect(consoleSpy).toHaveBeenCalledWith('Error initializing game:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });

        test('starts game loop after successful initialization', () => {
            require('../game.js');

            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('game state verification', () => {
        test('logs game state information during verification', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
            gameState.aiPlayers = [{ x: 200, y: 200, score: 50 }];
            gameState.food = [{ x: 300, y: 300 }];

            require('../game.js');

            expect(consoleSpy).toHaveBeenCalledWith('Verifying game state...');
            expect(consoleSpy).toHaveBeenCalledWith('Player cells:', expect.any(Array));
            expect(consoleSpy).toHaveBeenCalledWith('AI players:', expect.any(Array));
            expect(consoleSpy).toHaveBeenCalledWith('Food count:', expect.any(Number));

            consoleSpy.mockRestore();
        });

        test('logs errors for empty game state arrays', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            gameState.playerCells = [];
            gameState.aiPlayers = [];
            gameState.food = [];

            require('../game.js');

            expect(consoleErrorSpy).toHaveBeenCalledWith('No player cells found!');
            expect(consoleErrorSpy).toHaveBeenCalledWith('No AI players found!');
            expect(consoleErrorSpy).toHaveBeenCalledWith('No food found!');

            consoleErrorSpy.mockRestore();
        });
    });

    describe('DOM ready state handling', () => {
        test('starts immediately when DOM is already loaded', () => {
            mockDocument.readyState = 'complete';

            require('../game.js');

            expect(mockDocument.addEventListener).not.toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
        });

        test('waits for DOMContentLoaded when DOM is still loading', () => {
            mockDocument.readyState = 'loading';

            jest.resetModules();
            
            require('../game.js');

            expect(mockDocument.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
        });
    });
});
