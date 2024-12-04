// Game Variables
let player1Score = [];
let player2Score = [];
let player1Dice = [];
let player2Dice = [];
let rollCount = 0;
let roundCount = 0;
let onlyPossibleRow = "blank";
let jokerCard = false;
let isPlayerOneTurn = true;

const transformValues = [
  [0, 30],
  [-5, 40],
  [0, 35],
  [5, 40],
  [0, 30]
];

// DOM Elements
const player1Container = document.getElementById("player1Container");
const player2Container = document.getElementById("player2Container");
const diceElements = document.querySelectorAll(".dice");
const rollButton = document.getElementById("roll");
const scoreTableCells = document.querySelectorAll(".cell");
const rollSound = new Audio("roll.wav");

// Event Listener for Roll Button
rollButton.addEventListener("click", rollDice);

// Main Dice Rolling Function
function rollDice() {
  rollCount++;
  const randomDice = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
  let counter = 0;

  diceElements.forEach((diceElement, index) => {
    if (diceElement.classList.contains("active") || rollCount === 1) {
      resetDicePositions();
      const [x, y] = transformValues[index];

      setTimeout(() => {
        counter++;
        changeDiePosition(diceElement, x, y);
        changeDiceFaces(randomDice);

        // Update the score table after the first dice roll
        if (counter === 1) {
          if (isPlayerOneTurn) {
            writeTempValuesInScoreTable(player1Dice);
          } else {
            writeTempValuesInScoreTable(player2Dice);
          }
        }

        // Disable the roll button after three rolls
        if (rollCount === 3) {
          rollButton.disabled = true;
          rollButton.style.opacity = 0.5;
        }

        rollSound.play();
      }, 500);
    }
  });
}

// Helper Function to Reset Dice Positions
function resetDicePositions() {
  diceElements.forEach(diceElement => {
    diceElement.style.transform = "none";
  });
}

// Helper Function to Change Dice Position
function changeDiePosition(diceElement, x, y) {
  const angle = 135 * Math.floor(Math.random() * 10);
  const diceRollDirection = isPlayerOneTurn ? -1 : 1;
  diceElement.style.transform = `translateX(${x}vw) translateY(${diceRollDirection * y}vh) rotate(${angle}deg)`;
}

// Helper Function to Update Dice Faces
function changeDiceFaces(randomDice) {
  diceElements.forEach((diceElement, index) => {
    if (rollCount === 1) {
      diceElement.classList.add("active");
    }

    if (diceElement.classList.contains("active")) {
      const face = diceElement.querySelector(".face");
      const diceValue = randomDice[index];

      if (isPlayerOneTurn) {
        player1Dice[index] = diceValue;
      } else {
        player2Dice[index] = diceValue;
      }

      face.src = `./assets/images/die/dice${diceValue}.png`;
    }
  });
}


// Show or hide the Return to Top button
window.addEventListener("scroll", () => {
  const button = document.getElementById("returnToTop");
  button.style.display = window.scrollY > 200 ? "block" : "none";
});

// Reset the position of all dice elements
function resetDicePositions() {
  diceElements.forEach(diceElement => {
    diceElement.style.transform = "none";
  });
}

// Change the position and rotation of a single dice element
function changeDiePosition(diceElement, x, y) {
  const angle = 135 * Math.floor(Math.random() * 10); // Random rotation angle
  const diceRollDirection = isPlayerOneTurn ? -1 : 1; // Determine roll direction
  diceElement.style.transform = `translateX(${x}vw) translateY(${diceRollDirection * y}vh) rotate(${angle}deg)`;
}

function changeDiceFaces(randomDice) {
  diceElements.forEach((diceElement, index) => {
    if (rollCount === 1) diceElement.classList.add("active");

    if (diceElement.classList.contains("active")) {
      // Assign random dice values to the current player's dice array
      if (isPlayerOneTurn) {
        player1Dice[index] = randomDice[index];
      } else {
        player2Dice[index] = randomDice[index];
      }

      // Update the dice face image
      const face = diceElement.querySelector(".face");
      face.src = `./assets/images/die/dice${randomDice[index]}.png`;
    }
  });
}

function resetDiceFaces() {
  diceElements.forEach((diceElement, index) => {
    const face = diceElement.querySelector(".face");
    diceElement.classList.remove("active");
    // Reset dice face to default image
    face.src = `./assets/images/die/dice${index + 1}.png`;
    // Reset any applied transformations
    diceElement.style.transform = "none";
  });
}

// Add click event listeners to dice
diceElements.forEach((diceElement, index) => {
  diceElement.addEventListener("click", () => {
    if (rollCount === 0) return; // Prevent interaction before the first roll

    diceElement.classList.toggle("active");

    if (!diceElement.classList.contains("active")) {
      // Reset transformation if dice is deactivated
      diceElement.style.transform = "none";
    } else {
      // Calculate new position if dice is activated
      const diceNumber = parseInt(diceElement.id.replace("die", ""), 10);
      const [x, y] = transformValues[diceNumber - 1];
      changeDiePosition(diceElement, x, y);
    }
  });
});

function writeTempValuesInScoreTable(dice) {
  // Determine the current player and set up variables
  const scoreTable = isPlayerOneTurn ? player1Score.slice() : player2Score.slice();
  const playerNumber = isPlayerOneTurn ? 1 : 2;

  jokerCard = false;
  onlyPossibleRow = "blank";

  // Handle Yahtzee scoring
  const yahtzeeScore = calculateYahtzee(dice);
  const yahtzeeElement = document.getElementById(`yahtzee${playerNumber}`);
  if (scoreTable[12] === undefined) {
    yahtzeeElement.innerHTML = yahtzeeScore;
  } else if (yahtzeeScore > 0 && scoreTable[12] !== undefined) {
    yahtzeeElement.innerHTML = parseInt(yahtzeeElement.innerHTML || 0, 10) + 100;
  }

  if (yahtzeeScore > 0) {
    if (scoreTable[dice[0] - 1] !== undefined && scoreTable[12] !== undefined) {
      jokerCard = true;
    } else if (scoreTable[dice[0] - 1] === undefined && scoreTable[12] !== undefined) {
      onlyPossibleRow = dice[0];
      writeTempValueOnOnlyPossibleRaw(dice, playerNumber);
      return;
    }
  }

  // Define the mapping for score categories and calculations
  const scoreCalculations = [
    { id: "ones", func: calculateOnes },
    { id: "twos", func: calculateTwos },
    { id: "threes", func: calculateThrees },
    { id: "fours", func: calculateFours },
    { id: "fives", func: calculateFives },
    { id: "sixes", func: calculateSixes },
    { id: "threeOfAKind", func: calculateThreeOfAKind },
    { id: "fourOfAKind", func: calculateFourOfAKind },
    { id: "fullHouse", func: calculateFullHouse },
    { id: "smallStraight", func: jokerCard ? () => 30 : calculateSmallStraight },
    { id: "largeStraight", func: jokerCard ? () => 40 : calculateLargeStraight },
    { id: "chance", func: calculateChance },
  ];

  // Update the score table dynamically
  scoreCalculations.forEach((calc, index) => {
    if (scoreTable[index] === undefined) {
      const score = calc.func(dice);
      document.getElementById(`${calc.id}${playerNumber}`).innerHTML = score;
    }
  });
}


function writeTempValueOnOnlyPossibleRaw(dice, playerNumber) {
  const scoreMapping = {
    1: calculateOnes,
    2: calculateTwos,
    3: calculateThrees,
    4: calculateFours,
    5: calculateFives,
    6: calculateSixes,
  };

  const scoreFunction = scoreMapping[dice[0]];
  if (scoreFunction) {
    const score = scoreFunction(dice);
    document.getElementById(`ones${playerNumber}`.replace('ones', dice[0])).innerHTML = score;
  }
}

scoreTableCells.forEach(cell => {
  cell.addEventListener("click", onCellClick);
});

function onCellClick() {
  const row = this.getAttribute("data-row");
  const column = this.getAttribute("data-column");

  // Validate conditions for a valid click
  if (rollCount === 0 || row === null || (onlyPossibleRow !== "blank" && row !== onlyPossibleRow)) {
    return;
  }

  // Determine the current player and update scores
  const currentPlayerScore = isPlayerOneTurn ? player1Score : player2Score;
  const upperSectionId = isPlayerOneTurn ? "sum1" : "sum2";
  const bonusId = isPlayerOneTurn ? "bonus1" : "bonus2";
  const totalId = isPlayerOneTurn ? "total1" : "total2";

  currentPlayerScore[row - 1] = parseInt(this.innerHTML);
  const upperSectionScore = calculateUpperSection(currentPlayerScore);
  const bonusScore = upperSectionScore > 63 ? 35 : 0;
  const lowerSectionScore = calculateLowerSectionScore(currentPlayerScore);
  const totalScore = upperSectionScore + lowerSectionScore + bonusScore;

  // Update UI
  document.getElementById(upperSectionId).innerHTML = upperSectionScore;
  document.getElementById(bonusId).innerHTML = bonusScore;
  document.getElementById(totalId).innerHTML = totalScore;

  // Style the clicked cell
  this.removeEventListener("click", onCellClick);
  this.style.color = "green";
  document.getElementById(upperSectionId).style.color = "green";
  document.getElementById(bonusId).style.color = "green";
  document.getElementById(totalId).style.color = "green";

  // Proceed to the next turn
  changeTurn();
}


function changeTurn() {
  // Increment the round count and reset necessary states
  roundCount++;
  updateScoreTable();
  resetDiceFaces();
  isPlayerOneTurn = !isPlayerOneTurn;
  rollCount = 0;

  // Determine the current and opponent's dice containers
  const currentContainer = isPlayerOneTurn ? player2Container : player1Container;
  const targetContainer = isPlayerOneTurn ? player1Container : player2Container;

  // Move all dice from the current container to the target container
  const currentContainerDice = currentContainer.querySelectorAll(".dice");
  currentContainerDice.forEach(diceElement => {
    diceElement.style.transform = "none";
    currentContainer.removeChild(diceElement);
    targetContainer.appendChild(diceElement);
  });

  // End game if maximum rounds are reached
  if (roundCount === 26) {
    calculateEndGameScore();
    return;
  }

  // Re-enable the roll button
  rollButton.disabled = false;
  rollButton.style.opacity = 1;
}


function updateScoreTable() {
  // Determine the current player's score table and column
  const scoreTable = isPlayerOneTurn ? player1Score.slice() : player2Score.slice();
  const column = isPlayerOneTurn ? 1 : 2;

  // Select all score cells for the current column
  const scoreCells = document.querySelectorAll(`[data-column="${column}"]`);

  // Iterate through each cell and update its value based on the score table
  scoreCells.forEach((cell, index) => {
    cell.innerHTML = scoreTable[index] !== undefined ? scoreTable[index] : "";
  });
}


function calculateEndGameScore() {
  const player1Total = parseInt(document.getElementById("total1").innerHTML, 10) || 0;
  const player2Total = parseInt(document.getElementById("total2").innerHTML, 10) || 0;

  const endGameMessage = player1Total === player2Total
    ? "It's a Draw!"
    : player1Total > player2Total
      ? "Player 1 Wins!"
      : "Player 2 Wins!";

  const messageElement = document.getElementById("endGameMessage");
  messageElement.innerHTML = endGameMessage;
  messageElement.style.fontWeight = "bold";
  messageElement.style.color = player1Total > player2Total ? "green" : player1Total < player2Total ? "red" : "orange";

  rollButton.disabled = true;
  rollButton.style.opacity = 0.5;
}



//---------------------Score calculation functions/logic-------------------------//


function calculateOnes(dice) {
  return calculateSingleNumber(dice, 1);
}

function calculateTwos(dice) {
  return calculateSingleNumber(dice, 2);
}

function calculateThrees(dice) {
  return calculateSingleNumber(dice, 3);
}

function calculateFours(dice) {
  return calculateSingleNumber(dice, 4);
}

function calculateFives(dice) {
  return calculateSingleNumber(dice, 5);
}

function calculateSixes(dice) {
  return calculateSingleNumber(dice, 6);
}

// Helper function for numbers 1 through 6
function calculateSingleNumber(dice, number) {
  return dice.filter(d => d === number).length * number;
}

function calculateChance(dice) {
  return dice.reduce((acc, val) => acc + val, 0);
}

function calculateYahtzee(dice) {
  return new Set(dice).size === 1 ? 50 : 0;
}

function calculateThreeOfAKind(dice) {
  // Create a map to count occurrences of each dice value
  const counts = {};
  dice.forEach(num => {
    counts[num] = (counts[num] || 0) + 1;
  });

  // Check if any value appears 3 or more times
  const hasThreeOfAKind = Object.values(counts).some(count => count >= 3);

  // If three of a kind exists, sum the dice; otherwise, return 0
  return hasThreeOfAKind ? dice.reduce((acc, val) => acc + val, 0) : 0;
}

function calculateFourOfAKind(dice) {
  // Create a map to count occurrences of each dice value
  const counts = {};
  dice.forEach(num => {
    counts[num] = (counts[num] || 0) + 1;
  });

  // Check if any value appears 4 or more times
  const hasFourOfAKind = Object.values(counts).some(count => count >= 4);

  // If four of a kind exists, sum the dice; otherwise, return 0
  return hasFourOfAKind ? dice.reduce((acc, val) => acc + val, 0) : 0;
}

function calculateFullHouse(dice) {
  // Create a map to count occurrences of each dice value
  const counts = {};
  dice.forEach(num => {
    counts[num] = (counts[num] || 0) + 1;
  });

  // Extract the frequency counts
  const values = Object.values(counts);

  // Check if there are two values: one appears twice, and the other appears three times
  const isFullHouse = values.includes(3) && values.includes(2);

  // Return score if it's a full house
  return isFullHouse ? 25 : 0;
}

function calculateSmallStraight(dice) {
  // Remove duplicates and sort the dice
  const diceCopy = [...new Set(dice)].sort((a, b) => a - b);

  // Check for small straight patterns
  const smallStraightPatterns = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6]
  ];

  // Check if any pattern is a subset of the diceCopy
  const isSmallStraight = smallStraightPatterns.some(pattern => 
    pattern.every(num => diceCopy.includes(num))
  );

  // Return the score if a small straight is found
  return isSmallStraight ? 30 : 0;
}


function calculateLargeStraight(dice) {
  // Remove duplicates and sort the dice
  const diceCopy = [...new Set(dice)].sort((a, b) => a - b);
  
  // Check if the sorted array matches a large straight pattern
  const isLargeStraight = JSON.stringify(diceCopy) === JSON.stringify([1, 2, 3, 4, 5]) || 
                          JSON.stringify(diceCopy) === JSON.stringify([2, 3, 4, 5, 6]);

  // Return the score if it's a large straight
  return isLargeStraight ? 40 : 0;
}

function calculateUpperSection(playerScore) {
  // Use array slicing and reduce to calculate the sum of the upper section
  return playerScore.slice(0, 6).reduce((total, score) => total + (score || 0), 0);
}

function calculateLowerSectionScore(playerScore) {
  // Retrieve lower section scores or default to 0
  const [threeOfAKind, fourOfAKind, fullHouse, smallStraight, largeStraight, chance] = [
    playerScore[6] || 0,
    playerScore[7] || 0,
    playerScore[8] || 0,
    playerScore[9] || 0,
    playerScore[10] || 0,
    playerScore[11] || 0
  ];

  // Retrieve Yahtzee score and check for additional points
  let yahtzee = playerScore[12] || 0;
  if (yahtzee > 0) {
    const playerNumber = isPlayerOneTurn ? 1 : 2;
    yahtzee = parseInt(document.getElementById(`yahtzee${playerNumber}`).innerHTML, 10) || 0;
  }

  // Calculate total lower section score
  return threeOfAKind + fourOfAKind + fullHouse + smallStraight + largeStraight + chance + yahtzee;
}
