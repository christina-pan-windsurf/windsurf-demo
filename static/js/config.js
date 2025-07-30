export const WORLD_SIZE = 2000;
export const FOOD_SIZE = 5;
export const STARTING_SCORE = 100;
export const AI_STARTING_SCORE = 50;  // Starting score for AI players
export const FOOD_SCORE = 10;
export const FOOD_COUNT = 100;
export const AI_COUNT = 10;
export const COLLISION_THRESHOLD = 1.1; // 10% size difference needed for consumption

// Split mechanics
export const MIN_SPLIT_SCORE = 40;  // Minimum score needed to split
export const SPLIT_VELOCITY = 12;   // Initial velocity of split cells
export const MAX_PLAYER_CELLS = 16; // Maximum number of cells a player can have
export const SPLIT_COOLDOWN = 5000; // Milliseconds before cells can merge back
export const MERGE_DISTANCE = 2;    // Distance threshold for merging cells

// Merge mechanics
export const MERGE_COOLDOWN = 10000;  // Time in ms before cells can merge
export const MERGE_FORCE = 0.3;       // Strength of the merging force
export const MERGE_START_FORCE = 0.1; // Initial attraction force (before merge cooldown)

// Flying mechanics
export const GRAVITY_FORCE = 0.5;        // Downward force when not flying
export const FLYING_SPEED = 8;           // Upward speed when spacebar held
export const DESCENT_SPEED = 12;         // Faster descent when shift held
export const MAX_ALTITUDE = 200;         // Maximum altitude limit
export const GROUND_LEVEL = 0;           // Ground altitude level
export const ALTITUDE_SCALE_FACTOR = 0.8; // How much altitude affects visual size
export const SHADOW_OPACITY = 0.3;       // Shadow transparency
export const ALTITUDE_COLOR_SHIFT = 30;  // HSL hue shift for altitude indication

export const COLORS = {
    PLAYER: '#008080',  // Teal color
    MINIMAP: {
        PLAYER: '#4CAF50',
        TOP_PLAYER: '#FFC107',
        OTHER: 'rgba(255, 255, 255, 0.3)'
    }
};
