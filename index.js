console.log('Очищайте пожалуйста local storage для правильного функционирования игры!');


import { Field } from "./field.js";
import { Plate } from "./plate.js";

const gameField = document.querySelector(".game-field");

const loseModal = document.querySelector(".pop-up-1");
const winModal = document.querySelector(".pop-up-2");
const recordsModal = document.querySelector(".pop-up-3");

const newGame = document.getElementById("new-game-button");
const tryAgain = document.getElementById("again-button");
const records = document.getElementById("records-button");
const closeRecords = document.getElementById("close-button");
const closeWin = document.getElementById("win-button");

const scoreElements = document.querySelectorAll(".score");
const bestScoreElement = document.getElementById("bestScore");

const recordsItems = recordsModal.querySelectorAll(".recordsList li");
const loseRecordsItems = loseModal.querySelectorAll(".recordsList li");
const winRecordsItems = winModal.querySelectorAll(".recordsList li");

const moveSound = new Audio("./assets/sounds/moveSound.mp3");
const loseSound = new Audio("./assets/sounds/loseSound.mp3");
const winSound = new Audio("./assets/sounds/winSound.mp3");

let score = 0;
let bestScore = 0;
let recordsList = [];

function initRecords() {
  const savedRecords = localStorage.getItem("savedRecords");
  const savedBestScore = localStorage.getItem("bestScore");

  if (savedRecords) {
    recordsList = JSON.parse(savedRecords);
  }
  if (savedBestScore) {
    bestScore = parseInt(savedBestScore);
  }

  bestScoreElement.textContent = bestScore;

  fillRecord();
}

initRecords();

newGame.addEventListener("click", function() {
  resetGame();
});

tryAgain.addEventListener("click", function() {
  loseModal.classList.add("non-visible");
  resetGame();
});

closeWin.addEventListener("click", function() {
  winModal.classList.add("non-visible");
  resetGame();
  unblockPlateMovement();
});

records.addEventListener("click", function() {
  recordsModal.classList.remove("non-visible");
  fillRecord();
  fillLoseRecord();
  blockPlateMovement();
})

closeRecords.addEventListener("click", function() {
  recordsModal.classList.add("non-visible");
  unblockPlateMovement();
})

const field = new Field(gameField);
field.addRandomSquare().linkPlate(new Plate(gameField));
field.addRandomSquare().linkPlate(new Plate(gameField));
setInput();

function setInput() {
  window.addEventListener("keydown", handleInput);
// для тачскрина-----------------------------------
  window.addEventListener("touchstart", handleTouchStart, { passive: false });
}

function stopInput() {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("touchstart", handleTouchStart);
}

window.addEventListener('keydown', function (e) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
});

function handleKeydown(e) {
  handleInput(e.key);
}

async function handleInput(e) {
  stopInput();

  switch (e.key) {
    case "ArrowUp":
      if (!possibleMoveUp()) {
        setInput();
        return;
      }
      await moveUp();
      break;

    case "ArrowDown":
      if (!possibleMoveDown()) {
        setInput();
        return;
      }
      await moveDown();
      break;

    case "ArrowLeft":
      if (!possibleMoveLeft()) {
        setInput();
        return;
      }
      await moveLeft();
      break;

    case "ArrowRight":
      if (!possibleMoveRight()) {
        setInput();
        return;
      }
      await moveRight();
      break;

    default:
      setInput();
      return;
  }

  const newPlate = new Plate(gameField);
  field.addRandomSquare().linkPlate(newPlate);

  if (!possibleMoveUp() && !possibleMoveDown() && !possibleMoveLeft() && !possibleMoveRight()) {
    await newPlate.waitForAnimationEnd()
    loseSound.play();
    loseModal.classList.remove("non-visible");
    addRecord();
    return;
  }

  check2048();
  setInput();
}

async function moveUp() {
  await movePlates(field.columns);
  // moveSound.play();
}

async function moveDown() {
  await movePlates(field.reverseColumns);
  // moveSound.play();
}

async function moveLeft() {
  await movePlates(field.rows);
  // moveSound.play();
}

async function moveRight() {
  await movePlates(field.reverseRows);
  // moveSound.play();
}

async function movePlates(groupedSquares) {
  const promises = [];
  groupedSquares.forEach((group) => movePlatesInGroup(group, promises));

  await Promise.all(promises);

  field.squares.forEach((square) => {
    square.hasNewPlate() && square.mergePlates();
  });
}

function movePlatesInGroup(group, promises) {
  for (let i = 1; i < group.length; i += 1) {
    if (group[i].isEmpty()) {
      continue;
    }

    const squareWithPlate = group[i];

    let targetSquare;
    let j = i - 1;
    while (j >= 0 && group[j].canMake(squareWithPlate.linkedPlate)) {
      targetSquare = group[j];
      j -= 1;
    }

    if (!targetSquare) {
      continue;
    }

    promises.push(squareWithPlate.linkedPlate.waitForMoveEnd());

    if (targetSquare.isEmpty()) {
      targetSquare.linkPlate(squareWithPlate.linkedPlate);
    } else {
      targetSquare.linkNewPlate(squareWithPlate.linkedPlate);
    }

    squareWithPlate.unlinkPlate();
  }
}

function possibleMoveUp() {
  return possibleMove(field.columns);
}

function possibleMoveDown() {
  return possibleMove(field.reverseColumns);
}

function possibleMoveLeft() {
  return possibleMove(field.rows);
}

function possibleMoveRight() {
  return possibleMove(field.reverseRows);
}

function possibleMove(groupedSquares) {
  return groupedSquares.some(group => possibleMoveInGroup(group));
}

function possibleMoveInGroup(group) {
  return group.some((square, index) => {
    if (index === 0) {
      return false;
    }

    if (square.isEmpty()) {
      return false;
    }

    const targetSquare = group[index - 1];
    return targetSquare.canMake(square.linkedPlate);
  });
}

function handleTouchStart(e) {
  stopInput();
  e.preventDefault();

  let touchStartData = e.changedTouches[0];
  let touchStartDate = new Date;

  window.addEventListener("touchend", async evt => {
    evt.preventDefault();
    let touchEndData = evt.changedTouches[0];

    if (new Date - touchStartDate > 500) {
      setInput();
      return;
    }

    let deltaX = touchEndData.pageX - touchStartData.pageX;
    let deltaY = touchEndData.pageY - touchStartData.pageY;

    if (Math.abs(deltaX) >= 55) {
      await handleInput(deltaX > 0 ? "ArrowRight" : "ArrowLeft")
    } else if (Math.abs(deltaY) >= 55) {
      await handleInput(deltaY > 0 ? "ArrowDown" : "ArrowUp");
    }
    setInput();
  })
}

window.updateScore = function(points) {
  score += points;
  scoreElements.forEach((scoreElement) => {
    scoreElement.textContent = score;
  });

  if (score > bestScore) {
    bestScore = score;
    bestScoreElement.textContent = bestScore;
  }
}

function savedBestScore() {
  if (score > bestScore) {
    bestScore = score;
  }
}

function resetGame() {
  score = 0;
  scoreElements.forEach((scoreElement) => {
    scoreElement.textContent = score;
  });

  field.squares.forEach(square => {
    if (square.linkedPlate) {
      square.linkedPlate.clear();
      square.unlinkPlate();
    }
  });

  field.addRandomSquare().linkPlate(new Plate(gameField));
  field.addRandomSquare().linkPlate(new Plate(gameField));

  setInput();
  addRecord();
  savedBestScore();
}

async function check2048() {
  if (field.squares.some(square => square.linkedPlate && square.linkedPlate.number === 2048)) {

    await new Promise(resolve => setTimeout(resolve, 500));

    winSound.play();
    winModal.classList.remove("non-visible");
    addRecord();
    fillWinRecord();
    blockPlateMovement();
  }
}

function addRecord() {
  savedRecords();
  savedBestScore();
  localStorage.setItem("savedRecords", JSON.stringify(recordsList));
  localStorage.setItem("bestScore", bestScore);
  fillRecord();
  fillLoseRecord();
  fillWinRecord();
}

function savedRecords() {
  if (recordsList) {
    recordsList.push(score);
    recordsList = recordsList
      .sort((a, b) => b - a)
      .slice(0, 10);

    localStorage.setItem("savedRecords", JSON.stringify(recordsList));
  } else if (recordsList == false) {
    localStorage.setItem("savedRecords", JSON.stringify([score]));
    recordsList = [score];
  }
}

function fillRecords(items) {
  items.forEach((elem, index) => {
    if (recordsList && recordsList[index] !== undefined) {
      elem.textContent = recordsList[index];
      if (recordsList[index] === score) {
        elem.classList.add("user-score");
      } else {
        elem.classList.remove("user-score");
      }
    } else {
      elem.textContent = "0";
      elem.classList.remove("user-score");
    }
  });
}

function fillRecord() {
  fillRecords(recordsItems);
}

function fillLoseRecord() {
  fillRecords(loseRecordsItems);
}

function fillWinRecord() {
  fillRecords(winRecordsItems);
}

function blockPlateMovement() {
  window.removeEventListener("keydown", handleInput);
}

function unblockPlateMovement() {
  window.addEventListener("keydown", handleInput, { once: true });
}