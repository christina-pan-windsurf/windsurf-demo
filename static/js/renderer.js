import { gameState } from './gameState.js';
import { getSize, calculateCenterOfMass } from './utils.js';
import { 
    WORLD_SIZE, 
    COLORS, 
    FOOD_SIZE, 
    ALTITUDE_SCALE_FACTOR, 
    SHADOW_OPACITY, 
    ALTITUDE_COLOR_SHIFT 
} from './config.js';

let canvas, ctx, minimapCanvas, minimapCtx, scoreElement, leaderboardContent;

export function initRenderer(canvasElements) {
    canvas = canvasElements.gameCanvas;
    ctx = canvas.getContext('2d');
    minimapCanvas = canvasElements.minimapCanvas;
    minimapCtx = minimapCanvas.getContext('2d');
    scoreElement = canvasElements.scoreElement;
    leaderboardContent = canvasElements.leaderboardContent;

    // Initial canvas setup
    resizeCanvas();
}

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawCircle(x, y, value, color, isFood, altitude = 0) {
    const baseSize = isFood ? value : getSize(value);
    const size = baseSize * (1 - (altitude / 200) * (1 - ALTITUDE_SCALE_FACTOR));
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawShadow(x, y, size, altitude) {
    if (altitude > 0) {
        const shadowSize = size * 0.8;
        const shadowOpacity = SHADOW_OPACITY * Math.min(1, altitude / 50);
        
        ctx.beginPath();
        ctx.arc(x, y, shadowSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.fill();
    }
}

function getAltitudeColor(baseColor, altitude) {
    if (altitude <= 0) return baseColor;
    
    const hueShift = (altitude / 200) * ALTITUDE_COLOR_SHIFT;
    return baseColor.replace(/hsl\((\d+)/, (match, hue) => 
        `hsl(${(parseInt(hue) + hueShift) % 360}`
    );
}

function drawCellWithName(x, y, score, color, name, altitude = 0) {
    const baseSize = getSize(score);
    const size = baseSize * (1 - (altitude / 200) * (1 - ALTITUDE_SCALE_FACTOR));
    const altitudeColor = getAltitudeColor(color, altitude);
    
    drawShadow(x, y, size, altitude);
    
    // Draw cell
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = altitudeColor;
    ctx.fill();

    // Draw name
    if (size > 20) {  // Only draw name if cell is big enough
        ctx.save();
        
        // Calculate font size based on cell size
        const fontSize = Math.max(12, Math.min(20, size / 2));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text stroke (outline)
        ctx.strokeText(name, x, y);
        // Draw text fill
        ctx.fillText(name, x, y);
        
        ctx.restore();
    }
}

export function drawGame() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update camera to follow player's center of mass
    const centerOfMass = calculateCenterOfMass(gameState.playerCells);
    gameState.camera.x = centerOfMass.x - canvas.width / 2;
    gameState.camera.y = centerOfMass.y - canvas.height / 2;

    if (gameState.flyingEnabled) {
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.lineWidth = 1;
        
        const gridSize = 100;
        const startX = Math.floor(gameState.camera.x / gridSize) * gridSize;
        const startY = Math.floor(gameState.camera.y / gridSize) * gridSize;
        
        for (let x = startX; x < gameState.camera.x + canvas.width; x += gridSize) {
            const screenX = x - gameState.camera.x;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvas.height);
            ctx.stroke();
        }
        
        for (let y = startY; y < gameState.camera.y + canvas.height; y += gridSize) {
            const screenY = y - gameState.camera.y;
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(canvas.width, screenY);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // Draw food
    gameState.food.forEach(food => {
        const screenX = food.x - gameState.camera.x;
        const screenY = food.y - gameState.camera.y;
        
        if (screenX >= -FOOD_SIZE && screenX <= canvas.width + FOOD_SIZE &&
            screenY >= -FOOD_SIZE && screenY <= canvas.height + FOOD_SIZE) {
            drawCircle(screenX, screenY, FOOD_SIZE, food.color, true, 0);
        }
    });

    // Draw AI players
    gameState.aiPlayers.forEach(ai => {
        const screenX = ai.x - gameState.camera.x;
        const screenY = ai.y - gameState.camera.y;
        const size = getSize(ai.score);
        
        if (screenX >= -size && screenX <= canvas.width + size &&
            screenY >= -size && screenY <= canvas.height + size) {
            drawCellWithName(screenX, screenY, ai.score, ai.color, ai.name, ai.altitude);
        }
    });

    // Draw player cells
    gameState.playerCells.forEach(cell => {
        const screenX = cell.x - gameState.camera.x;
        const screenY = cell.y - gameState.camera.y;
        const size = getSize(cell.score);
        
        if (screenX >= -size && screenX <= canvas.width + size &&
            screenY >= -size && screenY <= canvas.height + size) {
            drawCellWithName(screenX, screenY, cell.score, COLORS.PLAYER, gameState.playerName, cell.altitude);
        }
    });

    // Update score display
    const totalScore = Math.floor(gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0));
    const avgAltitude = gameState.playerCells.length > 0 ? 
        Math.floor(gameState.playerCells.reduce((sum, cell) => sum + cell.altitude, 0) / gameState.playerCells.length) : 0;
    
    if (gameState.flyingEnabled) {
        scoreElement.textContent = `Score: ${totalScore} | Mode: Flying | Altitude: ${avgAltitude}`;
    } else {
        scoreElement.textContent = `Score: ${totalScore} | Mode: Normal`;
    }
}

export function drawMinimap() {
    if (!minimapCtx) return;

    const MINIMAP_SIZE = 150;
    const scale = MINIMAP_SIZE / WORLD_SIZE;
    
    minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    minimapCtx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    
    const viewWidth = canvas.width * scale;
    const viewHeight = canvas.height * scale;
    const viewX = gameState.camera.x * scale;
    const viewY = gameState.camera.y * scale;
    minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    minimapCtx.strokeRect(viewX, viewY, viewWidth, viewHeight);

    // Draw AI players on minimap
    gameState.aiPlayers.forEach(ai => {
        minimapCtx.beginPath();
        minimapCtx.arc(
            ai.x * scale,
            ai.y * scale,
            2,
            0,
            Math.PI * 2
        );
        minimapCtx.fillStyle = COLORS.MINIMAP.OTHER;
        minimapCtx.fill();
    });

    // Draw player cells on minimap
    gameState.playerCells.forEach(cell => {
        minimapCtx.beginPath();
        minimapCtx.arc(
            cell.x * scale,
            cell.y * scale,
            3,
            0,
            Math.PI * 2
        );
        minimapCtx.fillStyle = COLORS.MINIMAP.PLAYER;
        minimapCtx.fill();
    });
}

export function updateLeaderboard() {
    if (!leaderboardContent) return;

    const playerTotalScore = gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0);
    
    // Combine player score with AI scores
    const allPlayers = [
        { 
            name: gameState.playerName,
            score: playerTotalScore,
            isPlayer: true
        },
        ...gameState.aiPlayers.map(ai => ({
            name: ai.name,
            score: ai.score,
            isPlayer: false
        }))
    ];

    allPlayers.sort((a, b) => b.score - a.score);
    
    leaderboardContent.innerHTML = allPlayers
        .slice(0, 5)
        .map((player, index) => `
            <div class="leaderboard-item">
                <span class="${player.isPlayer ? 'player-name' : ''}">${index + 1}. ${player.name}</span>
                <span>${Math.floor(player.score)}</span>
            </div>
        `)
        .join('');
}
