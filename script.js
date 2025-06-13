const board = document.getElementById("board");
const statusText = document.getElementById("status");
const aiToggle = document.getElementById("aiToggle");
const darkToggle = document.getElementById("darkToggle");
const difficultySelect = document.getElementById("difficulty");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");

let currentPlayer = "X";
let gameActive = true;
let cells = Array(9).fill("");
let scores = { X: 0, O: 0, draw: 0 };

darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
});

function createBoard() {
  board.innerHTML = "";
  cells.forEach((_, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  });
  updateStatus();
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || cells[index]) return;

  makeMove(index, currentPlayer);
  clickSound.play();

  if (aiToggle.checked && currentPlayer === "O" && gameActive) {
    setTimeout(aiMove, 500);
  }
}

function makeMove(index, player) {
  if (cells[index]) return;
  cells[index] = player;
  const cell = board.children[index];
  cell.textContent = player;

  if (checkWinner(player)) {
    statusText.textContent = `🎉 Player ${player} Wins!`;
    gameActive = false;
    winSound.play();
    scores[player]++;
    updateScores();
    return;
  }

  if (cells.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw!";
    gameActive = false;
    scores.draw++;
    updateScores();
    return;
  }

  currentPlayer = player === "X" ? "O" : "X";
  updateStatus();
}

function updateStatus() {
  const emoji = currentPlayer === "X" ? "❌" : "⭕";
  statusText.textContent = `Player ${currentPlayer}'s Turn ${emoji}`;
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

function aiMove() {
  const level = difficultySelect.value;

  let index;
  if (level === "easy") {
    const empty = cells.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);
    index = empty[Math.floor(Math.random() * empty.length)];
  } else {
    index = getBestMove("O");
  }

  makeMove(index, "O");
}

function getBestMove(player) {
  const opponent = player === "X" ? "O" : "X";

  function minimax(newBoard, isMaximizing) {
    const winner = getWinner(newBoard);
    if (winner === player) return 10;
    if (winner === opponent) return -10;
    if (!newBoard.includes("")) return 0;

    const scores = [];
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = isMaximizing ? player : opponent;
        const score = minimax(newBoard, !isMaximizing);
        scores.push(score);
        newBoard[i] = "";
      }
    }

    return isMaximizing ? Math.max(...scores) : Math.min(...scores);
  }

  let bestScore = -Infinity;
  let bestMove;
  for (let i = 0; i < 9; i++) {
    if (cells[i] === "") {
      cells[i] = player;
      const score = minimax(cells, false);
      cells[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

function getWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const combo of wins) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function checkWinner(player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  return winPatterns.some(pattern => {
    if (pattern.every(i => cells[i] === player)) {
      pattern.forEach(i => board.children[i].classList.add("win"));
      return true;
    }
    return false;
  });
}

function restartGame() {
  cells = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  createBoard();
}

createBoard();