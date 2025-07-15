const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 10;

// Ball settings
const BALL_SIZE = 14;
const BALL_SPEED = 5;

// Left paddle (player)
let leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;

// Right paddle (AI)
let rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
const AI_SPEED = 4;

// Ball
let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

// Mouse control for left paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp within canvas
    leftPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, leftPaddleY));
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function resetBall() {
    ballX = WIDTH / 2 - BALL_SIZE / 2;
    ballY = HEIGHT / 2 - BALL_SIZE / 2;
    ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

function updateAI() {
    // Simple AI: Move towards ball
    let aiCenter = rightPaddleY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY + BALL_SIZE / 2 - 10) {
        rightPaddleY += AI_SPEED;
    } else if (aiCenter > ballY + BALL_SIZE / 2 + 10) {
        rightPaddleY -= AI_SPEED;
    }
    // Clamp AI paddle
    rightPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, rightPaddleY));
}

function collisionDetect(px, py, bx, by, paddleW, paddleH, ballSize) {
    // Axis-aligned rectangle collision
    return (
        bx < px + paddleW &&
        bx + ballSize > px &&
        by < py + paddleH &&
        by + ballSize > py
    );
}

function update() {
    // Move ball
    ballX += ballVelX;
    ballY += ballVelY;

    // Top/bottom wall collision
    if (ballY <= 0) {
        ballY = 0;
        ballVelY *= -1;
    }
    if (ballY + BALL_SIZE >= HEIGHT) {
        ballY = HEIGHT - BALL_SIZE;
        ballVelY *= -1;
    }

    // Left paddle collision
    if (
        collisionDetect(
            PADDLE_MARGIN,
            leftPaddleY,
            ballX,
            ballY,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            BALL_SIZE
        )
    ) {
        ballX = PADDLE_MARGIN + PADDLE_WIDTH;
        ballVelX *= -1;
        // Add some "english" based on where it hits the paddle
        let hitPos = (ballY + BALL_SIZE / 2) - (leftPaddleY + PADDLE_HEIGHT / 2);
        ballVelY += hitPos * 0.1;
    }

    // Right paddle (AI) collision
    if (
        collisionDetect(
            WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
            rightPaddleY,
            ballX,
            ballY,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            BALL_SIZE
        )
    ) {
        ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
        ballVelX *= -1;
        let hitPos = (ballY + BALL_SIZE / 2) - (rightPaddleY + PADDLE_HEIGHT / 2);
        ballVelY += hitPos * 0.1;
    }

    // Ball out of bounds (score)
    if (ballX < -BALL_SIZE || ballX > WIDTH + BALL_SIZE) {
        resetBall();
    }

    updateAI();
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw paddles
    drawRect(PADDLE_MARGIN, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
    drawRect(
        WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
        rightPaddleY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        "#fff"
    );

    // Draw ball
    drawBall(ballX, ballY, BALL_SIZE, "#fff");

    // Draw center line
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();