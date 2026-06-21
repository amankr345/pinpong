// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleHeight = 100;
const paddleWidth = 10;
const ballSize = 8;
const ballSpeed = 5;
const paddleSpeed = 6;

// Paddle objects
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeed,
    dy: ballSpeed,
    speed: ballSpeed
};

// Score
let playerScore = 0;
let computerScore = 0;
const maxScore = 11;

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for player paddle
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Smooth paddle following
    const paddleCenter = playerPaddle.y + playerPaddle.height / 2;
    const diff = mouseY - paddleCenter;
    
    if (Math.abs(diff) > 5) {
        playerPaddle.dy = Math.sign(diff) * paddleSpeed;
    } else {
        playerPaddle.dy = 0;
    }
});

// Update player paddle position with keyboard
function updatePlayerPaddle() {
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        playerPaddle.dy = -paddleSpeed;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        playerPaddle.dy = paddleSpeed;
    }
    
    playerPaddle.y += playerPaddle.dy;
    
    // Boundary collision for player paddle
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    
    // Simple AI - follows the ball with slight randomness
    const difficulty = 0.06; // Adjust this for difficulty (0-1, higher = harder)
    const targetY = ballCenter - computerPaddle.height / 2;
    
    if (computerCenter < ballCenter - 35) {
        computerPaddle.dy = paddleSpeed * difficulty;
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.dy = -paddleSpeed * difficulty;
    } else {
        computerPaddle.dy = 0;
    }
    
    computerPaddle.y += computerPaddle.dy;
    
    // Boundary collision for computer paddle
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }
    
    // Paddle collision
    if (checkPaddleCollision(playerPaddle)) {
        ball.dx = Math.abs(ball.dx);
        ball.x = playerPaddle.x + playerPaddle.width + ball.size;
        // Add spin based on paddle movement
        ball.dy += playerPaddle.dy * 0.2;
    }
    
    if (checkPaddleCollision(computerPaddle)) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computerPaddle.x - ball.size;
        // Add spin based on paddle movement
        ball.dy += computerPaddle.dy * 0.2;
    }
    
    // Scoring (ball goes out of bounds)
    if (ball.x < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Check collision between ball and paddle
function checkPaddleCollision(paddle) {
    return (
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    );
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * 2 * ball.speed;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    
    if (playerScore >= maxScore) {
        alert(`🎉 You win! Final score: ${playerScore} - ${computerScore}`);
        resetGame();
    } else if (computerScore >= maxScore) {
        alert(`🤖 Computer wins! Final score: ${computerScore} - ${playerScore}`);
        resetGame();
    }
}

// Reset game
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    computerPaddle.y = canvas.height / 2 - paddleHeight / 2;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#4ecca3';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(78, 204, 163, 0.5)';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(78, 204, 163, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
}

// Game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();