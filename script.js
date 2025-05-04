const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const box = 20;
const rows = canvas.height / box;
const cols = canvas.width / box;

let snake = [{ x: 9 * box, y: 9 * box }];
let direction = "RIGHT";
let food = {
  x: Math.floor(Math.random() * cols) * box,
  y: Math.floor(Math.random() * rows) * box
};
let score = 0;

// Função para obter valores CSS definidos como variáveis
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Função para desenhar o retângulo arredondado com cantos específicos
function drawRoundedRect(x, y, width, height, radius, fillStyle, corners) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + (corners.tl ? radius : 0), y);
  ctx.lineTo(x + width - (corners.tr ? radius : 0), y);
  if (corners.tr) ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  else ctx.lineTo(x + width, y);

  ctx.lineTo(x + width, y + height - (corners.br ? radius : 0));
  if (corners.br) ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  else ctx.lineTo(x + width, y + height);

  ctx.lineTo(x + (corners.bl ? radius : 0), y + height);
  if (corners.bl) ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  else ctx.lineTo(x, y + height);

  ctx.lineTo(x, y + (corners.tl ? radius : 0));
  if (corners.tl) ctx.quadraticCurveTo(x, y, x + radius, y);
  else ctx.lineTo(x, y);

  ctx.closePath();
  ctx.fill();
}

// Função para desenhar os olhos da cobra
function drawEyes(x, y, direction) {
  const eyeOffset = 4; // Distância dos olhos da borda da cabeça
  const eyeSize = 3; // Tamanho dos olhos
  ctx.fillStyle = "white"; // Cor dos olhos

  // Olhos da cobra dependendo da direção
  if (direction === "UP") {
    ctx.beginPath();
    ctx.arc(x - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2); // olho esquerdo
    ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2); // olho direito
    ctx.fill();
    ctx.closePath();
  } else if (direction === "DOWN") {
    ctx.beginPath();
    ctx.arc(x - eyeOffset, y - eyeOffset, eyeSize, 0, Math.PI * 2); // olho esquerdo
    ctx.arc(x + eyeOffset, y - eyeOffset, eyeSize, 0, Math.PI * 2); // olho direito
    ctx.fill();
    ctx.closePath();
  } else if (direction === "LEFT") {
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2); // olho direito
    ctx.arc(x + eyeOffset, y - eyeOffset, eyeSize, 0, Math.PI * 2); // olho esquerdo
    ctx.fill();
    ctx.closePath();
  } else if (direction === "RIGHT") {
    ctx.beginPath();
    ctx.arc(x - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2); // olho esquerdo
    ctx.arc(x - eyeOffset, y - eyeOffset, eyeSize, 0, Math.PI * 2); // olho direito
    ctx.fill();
    ctx.closePath();
  }
}

document.addEventListener("keydown", changeDirection);

function changeDirection(e) {
  const key = e.key;

  if ((key === "ArrowLeft" || key === "a") && direction !== "RIGHT") direction = "LEFT";
  else if ((key === "ArrowUp" || key === "w") && direction !== "DOWN") direction = "UP";
  else if ((key === "ArrowRight" || key === "d") && direction !== "LEFT") direction = "RIGHT";
  else if ((key === "ArrowDown" || key === "s") && direction !== "UP") direction = "DOWN";
}

function draw() {
  // Verifica colisão com a parede **antes** de mover a cobra
  let head = { ...snake[0] };

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
  ) {
    clearInterval(game);
    alert("💀 Game Over!");
    return; // Saímos da função draw para evitar mais atualizações após a colisão
  }

  // Mover a cobra depois de verificar colisão
  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  // Verificação de colisão com o corpo
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      clearInterval(game);
      alert("💀 Game Over!");
      return; // Saímos da função draw para evitar mais atualizações após a colisão
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // desenha a cobra
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      // Cabeça arredondada com base na direção
      let corners = { tl: false, tr: false, br: false, bl: false };

      switch (direction) {
        case "UP":
          corners.tl = true;
          corners.tr = true;
          break;
        case "DOWN":
          corners.bl = true;
          corners.br = true;
          break;
        case "LEFT":
          corners.tl = true;
          corners.bl = true;
          break;
        case "RIGHT":
          corners.tr = true;
          corners.br = true;
          break;
      }

      drawRoundedRect(
        snake[i].x,
        snake[i].y,
        box,
        box,
        6, // raio de arredondamento
        getCSSVar("--cobra-cabeca"),
        corners // passa a direção para arredondar os cantos corretos
      );

      // Desenho dos olhos na cabeça
      drawEyes(snake[i].x + box / 2, snake[i].y + box / 2, direction);
    } else {
      // Corpo normal
      ctx.fillStyle = getCSSVar("--cobra-corpo");
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }
  }

  // desenha comida
  ctx.fillStyle = getCSSVar("--roxo-comida");
  ctx.beginPath();
  ctx.arc(
    food.x + box / 2, // centro x
    food.y + box / 2, // centro y
    box / 2 - 2,      // raio (ligeiramente menor que o box)
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.closePath();

  // comer comida
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").innerText = "Pontuação: " + score;
    food = {
      x: Math.floor(Math.random() * cols) * box,
      y: Math.floor(Math.random() * rows) * box
    };
  } else {
    snake.pop(); // remove cauda se não comer
  }

  snake.unshift(head);
}

const game = setInterval(draw, 100);