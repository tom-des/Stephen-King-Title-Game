// Randomizer function

function getRandom(max) {
  return Math.floor(Math.random() * max);
}

// Query Selector replacement

function getElem(cssSelector) {
  return document.querySelector(cssSelector);
}

// Pick 10 titles at random

let titles = [];

for (let i = 0; i < 10; i++) {
  let allTitlesLength = allTitles.length;

  let number = getRandom(allTitlesLength);
  titles.push(allTitles[number]);
  allTitles.splice(number, 1);
}

const originalTitlesLength = titles.length;

// Define the elements

const whiteButton = getElem('#white-button');
const redButton = getElem('#red-button');
const topText = getElem('#top-text');
const subText = getElem('#sub-text');
const titleText = getElem('#title');
const inputText = getElem('#input');
const hardModeText = getElem('#hard-mode');

// Check user for initial data

if (!localStorage.getItem('highScore')) {
  localStorage.setItem('highScore', 0);
}

if (!localStorage.getItem('bestStreak')) {
  localStorage.setItem('bestStreak', 0);
}

let hardMode = window.location.search.substring(1).match('hardmode=on');

if (hardMode) {
  hardModeText.textContent = 'HARD MODE IS ON';
  hardModeText.style.color = 'red';
}

// Function to create game object

function createGame() {
  game = {
    titlesRemaining: titles.length,
    currentStreak: 0,
    bestStreak: localStorage.getItem('bestStreak'),
    score: 0,
    firstRound: true,
    hardMode: hardMode,
    highScore: localStorage.getItem('highScore'),
  };
}

// Initialize the game

window.onload = createGame();
refresh();

// Add event listeners

whiteButton.addEventListener('click', refresh);
redButton.addEventListener('click', submit);
document.addEventListener('keydown', (key) => {
  if (key.code == 'Enter' && whiteButton.textContent == 'Next') {
    refresh();
  }
  if (key.code == 'Enter' && whiteButton.textContent == 'Give Up') {
    submit();
  }
});
hardModeText.addEventListener('click', (elem) => {
  if (game.hardMode) {
    game.hardMode = false;
    hardModeText.style.color = 'white';
    hardModeText.textContent = 'HARD MODE IS OFF';
    getElem('body').className = '';
    titleText.className = '';
  } else {
    game.hardMode = true;
    hardModeText.textContent = 'HARD MODE IS ON';
    hardModeText.style.color = 'red';
    getElem('body').className = 'red-fade';
    titleText.className = 'black-fade';
  }
});

// Function to update game fields

function updateScoreCard() {
  getElem(
    '#remaining'
  ).textContent = `${game.titlesRemaining}/${originalTitlesLength} titles remaining`;
  getElem('#streak').textContent = `Current streak: ${game.currentStreak}`;
  getElem('#score').textContent = `Score: ${game.score}`;
  getElem('#best').textContent = `Best streak: ${game.bestStreak}`;
  getElem('#high-score').textContent = `High score: ${game.highScore}`;
}

// Function to shuffle the title letters

function shuffleTitle() {
  titlesLength = titles.length;
  titleNumber = getRandom(titlesLength);
  title = titles[titleNumber];
  console.log(title);
  answer = title.toUpperCase();
  answerArray = answer.split('');

  shuffledTitle = '';

  // Normal mode word processing (keep space structure)

  if (!game.hardMode) {
    spacePositions = [];

    answerArray.forEach((letter, index) => {
      if (letter == ' ') {
        spacePositions.push(index);
      }
    });

    answerArray = answerArray.join('').replace(/ /g, '').split('');
  }

  // Return to universal shuffling sequence

  answerLength = answerArray.length;

  points += answerLength; // Increase turn points based on answer length

  do {
    num = getRandom(answerLength);

    shuffledTitle += answerArray[num];

    answerArray.splice(num, 1);
    answerLength = answerArray.length;

    if (answer == shuffledTitle) {
      answerArray = answer.split('');
      answerLength = answerArray.length;
      shuffledTitle = '';
      continue;
    }
  } while (answerLength > 0);

  // Normal mode word post-processing

  if (!game.hardMode) {
    shuffledTitleArray = shuffledTitle.split('');

    spacePositions.forEach((index) => {
      shuffledTitleArray.splice(index, 0, ' ');
    });

    shuffledTitle = shuffledTitleArray.join('');
  }
}

// Function to reset the game

function refresh() {
  // Set the initial value of turn points
  if (game.hardMode) {
    points = (game.currentStreak + 1) * 2;
  } else {
    points = game.currentStreak + 1;
  }
  // Title placeholder

  titleText.textContent = 'Loading...';

  // Handle game states based on white button text

  // Normal, not first round state

  if (!game.firstRound) {
    inputText.focus();

    if (whiteButton.textContent == 'Give Up') {
      inputText.value = '';
      game.currentStreak = 0;
      titleText.textContent = answer;
      redButton.style.display = 'none';
      subText.textContent = 'Was the title.';
      topText.textContent = 'SORRY';
      whiteButton.textContent = 'Next';

      updateScoreCard();
      return;
    }

    // Handle game reset state

    if (whiteButton.textContent == 'Play Again') {
      location.reload();
      return;
    }

    // Handle game over state

    if (titles.length === 0) {
      game.titlesRemaining = titles.length;
      topText.textContent = 'YOU MADE IT';
      subText.textContent = 'Nicely done.';
      titleText.textContent = 'GAME OVER';
      redButton.style.display = 'none';
      inputText.style.display = 'none';
      whiteButton.textContent = 'Play Again';
      if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem('highScore', game.score);
        titleText.textContent = 'NEW HIGH SCORE';
      }
      updateScoreCard();
      return;
    }
  }

  // Generate the shuffled title

  shuffleTitle();

  // Reset the gameboard to normal state

  redButton.style.display = '';
  whiteButton.textContent = 'Give Up';
  titleText.textContent = shuffledTitle;
  subText.textContent = 'Guess wisely.';
  inputText.value = '';
  topText.textContent = 'WHAT IS THE TITLE?';

  // Update the titles and score card

  titles.splice(titleNumber, 1);
  game.titlesRemaining = titlesLength;
  updateScoreCard();
  game.firstRound = false;
}

// Function to check the answer submitted

function submit() {
  input = inputText.value;
  inputClean = input.toUpperCase().replace(/\W/g, '');
  answerClean = answer.replace(/\W/g, '');

  // If the input is empty

  if (!input && whiteButton.textContent == 'Give Up') {
    subText.textContent = 'Enter your guess.';
    return;
  }

  // If the submission is correct

  if (inputClean == answerClean) {
    // Format the gameboard

    whiteButton.innerText = 'Next';
    titleText.textContent = answer;
    subText.textContent = 'Well done.';
    redButton.style.display = 'none';
    topText.textContent = `CORRECT (+${points} points)`;

    // Update the game data

    game.currentStreak++;
    game.score += points;
    inputText.value = '';

    if (game.bestStreak < game.currentStreak) {
      game.bestStreak = game.currentStreak;
      localStorage.setItem('bestStreak', game.currentStreak);
    }
    updateScoreCard();
    return;
  }

  // If the submission is incorrect
  if (inputClean != answerClean) {
    game.currentStreak = 0;
    subText.textContent = 'Try again.';

    updateScoreCard();
    return;
  }
}
