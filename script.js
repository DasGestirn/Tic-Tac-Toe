"use strict";

///// DOM Elements

const selectMessage = document.getElementById("select_message");
const againMessage = document.getElementById("again_message");
const turnMessage = document.getElementById("turn_message");
const gameArea = document.getElementById("game_area");
const gameGrids = document.querySelectorAll(".game_grid");
const buttonsModes = document.querySelectorAll(".buttons_modes");
const buttonsStart = document.querySelectorAll(".start-buttons__button");
const buttonsStartBlock = document.querySelector(".start-buttons");
const lineRow = document.getElementById("line_row");
const lineColumn = document.getElementById("line_column");
const lineDiagonalMain = document.getElementById("line_diagonal_main");
const lineDiagonalSecondary = document.getElementById("line_diagonal_secondary");
const xHtml = `<i class="bx bx-x"></i>`;
const oHtml = `<i class="bx bx-circle"></i>`;

///// GAME ELEMENTS

// If it's X's turn, then 'turn' will be true, and it will be false if it's O's turn.
let turn = true;

// 'playing' will prohibit the game from continuing if it is false.
let playing = true;

// Determines from which button was clicked if the player wants to play against bot or not.
let isBot;

// Difficulty of the bot, according to player's choice.
let difficultyBot;

// Determines if the player wants to start as X or O against the bot.

let playX;

//board represents the 3x3 matrix of the tic tac toe game, and will be used for determining the winner.

let board = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

///// AUXILIARY FUNCTIONS

function hide(el) {
  el.classList.add("hidden");
}

function show(el) {
  el.classList.remove("hidden");
}

function hideLines() {
  lineRow.classList.add("hidden");
  lineColumn.classList.add("hidden");
  lineDiagonalMain.classList.add("hidden");
  lineDiagonalSecondary.classList.add("hidden");
}

function initializeGame(bot) {
  if (bot) {
  } else {
    turn = true;
    show(gameArea);
    show(turnMessage);
    updateTurnMessage(true);
  }

  hide(selectMessage);
  hide(againMessage);

  board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  hideLines();
  gameGrids.forEach((grid) => {
    grid.replaceChildren();
    grid.dataset.clicked = "0";
  });
}

////////// GAME FUNCTIONS

function updateSymbolGrid(el, turnBool) {
  turnBool ? el.insertAdjacentHTML("beforeend", xHtml) : el.insertAdjacentHTML("beforeend", oHtml);
}

function updateClickedGrid(el) {
  el.dataset.clicked = "1";
}

function updateSymbolBoard(el, turnBool) {
  turnBool
    ? (board[el.dataset.row][el.dataset.column] = "x")
    : (board[el.dataset.row][el.dataset.column] = "o");
}

function updateTurnMessage(turnBool) {
  const message = turnBool ? "X turn." : "O turn.";
  turnMessage.textContent = message;
}

function updateGameAfterClick(el, turnBool) {
  updateSymbolGrid(el, turnBool);
  updateClickedGrid(el);
  updateSymbolBoard(el, turnBool);
}

function winnerMessage(turnBool) {
  const message = !turnBool ? "X wins!" : "O wins!";
  turnMessage.textContent = message;
}

// Functions related to drawing the line at the end of each match.
function drawRow(row) {
  const num = 15.33 + 33.33 * Number(row);
  lineRow.style.top = `${num}%`;
  lineRow.classList.remove("hidden");
}

function drawColumn(column) {
  const num = 15.33 + 33.33 * Number(column);
  lineColumn.style.left = `${num}%`;
  lineColumn.classList.remove("hidden");
}

function drawMainDiagonal() {
  lineDiagonalMain.classList.remove("hidden");
}

function drawSecondaryDiagonal() {
  lineDiagonalSecondary.classList.remove("hidden");
}

function checkRow(row) {
  if (
    board[row][0] !== null &&
    board[row][0] === board[row][1] &&
    board[row][0] === board[row][2]
  ) {
    return true;
  }

  return false;
}

function checkColumn(column) {
  if (
    board[0][column] !== null &&
    board[0][column] === board[1][column] &&
    board[0][column] === board[2][column]
  ) {
    return true;
  }

  return false;
}

function checkMainDiagonal() {
  if (board[0][0] !== null && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return true;
  }

  return false;
}

function checkSecondaryDiagonal() {
  if (board[0][2] !== null && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return true;
  }

  return false;
}

function drawLines(row, column) {
  if (checkRow(row)) {
    drawRow(row);
  }
  if (checkColumn(column)) {
    drawColumn(column);
  }

  if (checkMainDiagonal()) {
    drawMainDiagonal();
  }

  if (checkSecondaryDiagonal()) {
    drawSecondaryDiagonal();
  }
}

function checkVictory(row, column) {
  return checkRow(row) || checkColumn(column) || checkMainDiagonal() || checkSecondaryDiagonal();
}

function checkDraw() {
  return board.flat().every((cell) => cell !== null);
}

function checkAndHandlePlayerVictoryOrDrawOnClick(e, isbot, turnBool) {
  if (checkVictory(e.currentTarget.dataset.row, e.currentTarget.dataset.column)) {
    playing = false;
    drawLines(e.currentTarget.dataset.row, e.currentTarget.dataset.column);
    show(turnMessage);
    isbot ? (turnMessage.textContent = "Player wins.") : winnerMessage(turnBool);
    show(againMessage);
    return true;
  } else if (checkDraw()) {
    playing = false;
    show(turnMessage);
    turnMessage.textContent = "The match ends with a draw.";
    show(againMessage);
    return true;
  }
}

///// -------------------------------------

///// BOT RELATED FUNCTIONS AND MINIMAX IMPLEMENTATION

function hasAvailableSlots(b) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (b[row][col] === null) {
        return true;
      }
    }
  }
  return false;
}
function findAvailableSlots() {
  const availableSlots = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        availableSlots.push([row, col]);
      }
    }
  }
  return availableSlots;
}

function makeRandomChoice() {
  const availableSlots = findAvailableSlots();
  const randomIndex = Math.floor(Math.random() * availableSlots.length);
  const randomChoice = availableSlots[randomIndex];
  return randomChoice;
}

function handleBotVictory() {
  show(againMessage);
  turnMessage.textContent = "Computer wins!";
  playing = false;
}

function botPlay(row, column, turnBool) {
  const ind = row * 3 + column;
  updateSymbolGrid(gameGrids[ind], turnBool);
  updateSymbolBoard(gameGrids[ind], turnBool);
  gameGrids[ind].dataset.clicked = "1";
}

function evaluate(b) {
  const playerSymbol = playX ? "x" : "o";

  for (let i = 0; i < 3; i++) {
    //Check rows for player victory

    if (b[i][0] !== null && b[i][0] === b[i][1] && b[i][0] === b[i][2]) {
      if (b[i][0] === playerSymbol) {
        return -10;
      } else {
        return 10;
      }
    }

    if (b[0][i] !== null && b[0][i] === b[1][i] && b[1][i] === b[2][i]) {
      if (b[0][i] === playerSymbol) {
        return -10;
      } else {
        return 10;
      }
    }
  }
  //Check main diagonal for player victory

  if (b[0][0] !== null && b[0][0] === b[1][1] && b[0][0] === b[2][2]) {
    if (b[0][0] === playerSymbol) {
      return -10;
    } else {
      return 10;
    }
  }

  //Check secondary diagonal for player victory

  if (b[0][2] !== null && b[0][2] === b[1][1] && b[0][2] === b[2][0]) {
    if (b[0][2] === playerSymbol) {
      return -10;
    } else {
      return 10;
    }
  }
  // returns 0 if it's a draw
  return 0;
}

function minimax(b, depth, isMax) {
  const playerSymbol = playX ? "x" : "o";
  const botSymbol = playX ? "o" : "x";
  let bestScore;

  const temporaryBoard = b;
  let score = evaluate(temporaryBoard);

  if (score === 10) {
    // If it's a win, the minimax will prioritize the shortest path to victory.
    return score - depth;
  } else if (score === -10) {
    // If it's a defeat, the minimax will prioritize the longest path to defeat (drag on).
    return score + depth;
  } else if (hasAvailableSlots(temporaryBoard) === false) {
    return depth;
  }

  // Bot is the maximising player, Human is the minimising player.
  if (isMax) {
    // Evaluating games for the maximising player (bot)
    bestScore = -Infinity;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (temporaryBoard[row][col] === null) {
          temporaryBoard[row][col] = botSymbol;
          let score = minimax(temporaryBoard, depth + 1, false);
          temporaryBoard[row][col] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    // Evaluating games for the minimising player (human)
    bestScore = Infinity;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (temporaryBoard[row][col] === null) {
          temporaryBoard[row][col] = playerSymbol;
          let score = minimax(temporaryBoard, depth + 1, true);
          temporaryBoard[row][col] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
    }
  }
  return bestScore;
}

function bestBotMove(b) {
  const botSymbol = playX ? "o" : "x";
  const temporaryBoard = b;
  let bestScore = -Infinity;
  let botMove = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (temporaryBoard[row][col] === null) {
        temporaryBoard[row][col] = botSymbol;
        let score = minimax(temporaryBoard, 0, false);
        temporaryBoard[row][col] = null;
        if (score > bestScore) {
          bestScore = score;
          botMove = [row, col];
        }
      }
    }
  }
  return botMove;
}

function checkAndHandleBotVictoryOrDrawOnPlay(row, column) {
  if (checkVictory(row, column)) {
    drawLines(row, column);
    show(turnMessage);
    handleBotVictory();
  } else if (checkDraw()) {
    show(turnMessage);
    turnMessage.textContent = "The match ends with a draw.";
    show(againMessage);
  }
}

///// -------------------------------------

buttonsModes.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    isBot = Boolean(Number(e.currentTarget.dataset.isbot));
    if (isBot) {
      playing = false;
      difficultyBot = e.currentTarget.dataset.difficulty;
      hide(turnMessage);
      show(buttonsStartBlock);
      hide(selectMessage);
      initializeGame(true);
    } else {
      hide(buttonsStartBlock);
      gameArea.style.visibility = "visible";
      playing = true;
      initializeGame(false);
    }
  });
});

// The code associated with buttonsStart only execute if the player wants to play against the bot.
buttonsStart.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    playing = true;
    playX = Boolean(Number(e.currentTarget.dataset.isx));
    turn = playX;
    hide(buttonsStartBlock);
    gameArea.style.visibility = "visible";

    if (!playX) {
      if (difficultyBot === "easy") {
        let [r, c] = makeRandomChoice();
        botPlay(r, c, !turn);
      } else if (difficultyBot === "medium") {
        const odd = Math.floor(Math.random());
        // In the medium difficulty, the bot will have a 30% chance of making a random choice.
        if (odd > 0.3) {
          let [r, c] = makeRandomChoice();
          botPlay(r, c, turn);
        } else {
          let [r, c] = bestBotMove(board);
          botPlay(r, c, !turn);
        }
      } else if (difficultyBot === "impossible") {
        let [r, c] = bestBotMove(board);
        botPlay(r, c, !turn);
      }
    }
  });
});

gameGrids.forEach((grid) => {
  grid.addEventListener("click", function (e) {
    if (!playing || Number(e.currentTarget.dataset.clicked)) return;

    if (isBot) {
      // Code for player vs bot mode
      updateGameAfterClick(e.currentTarget, turn);
      turn = !turn;
      playing = false;

      if (checkAndHandlePlayerVictoryOrDrawOnClick(e, isBot, turn)) return;

      setTimeout(() => {
        playing = true;
        if (difficultyBot === "easy") {
          let [r, c] = makeRandomChoice();
          botPlay(r, c, turn);
          turn = !turn;
          checkAndHandleBotVictoryOrDrawOnPlay(r, c);
        } else if (difficultyBot === "medium") {
          const odd = Math.random();
          if (odd > 0.4) {
            let [r, c] = makeRandomChoice();
            botPlay(r, c, turn);
            checkAndHandleBotVictoryOrDrawOnPlay(r, c);
            turn = !turn;
          } else {
            let [r, c] = bestBotMove(board);
            botPlay(r, c, turn);
            checkAndHandleBotVictoryOrDrawOnPlay(r, c);
            turn = !turn;
          }
        } else if (difficultyBot === "impossible") {
          let [r, c] = bestBotMove(board);
          botPlay(r, c, turn);
          turn = !turn;
          checkAndHandleBotVictoryOrDrawOnPlay(r, c);
        }
      }, 300);
    } else {
      // Code for player vs player mode
      updateGameAfterClick(e.currentTarget, turn);
      turn = !turn;
      updateTurnMessage(turn);

      if (checkAndHandlePlayerVictoryOrDrawOnClick(e, isBot, turn)) return;
    }
  });
});
