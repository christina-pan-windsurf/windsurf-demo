import { WORLD_SIZE, STARTING_SCORE, GROUND_LEVEL } from './config.js';

export const gameState = {
    gameMode: 'normal', // 'normal' or 'flying'
    flyingEnabled: false,
    playerCells: [{
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        score: STARTING_SCORE,
        velocityX: 0,
        velocityY: 0,
        altitude: GROUND_LEVEL,
        verticalVelocity: 0
    }],
    playerName: 'Windsurf',
    camera: {
        x: 0,
        y: 0
    },
    food: [],
    aiPlayers: []
};

export const mouse = { x: 0, y: 0 };
export const keys = { space: false, shift: false };
