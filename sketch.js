let populationO = [];
let populationX = [];
let brainO, brainX;
let deadO = [];
let deadX = [];

let game;
let gameLen = 0;
let forcedWin = 0;
let totalGames = 0;
let goodGames = 0;
let generations = 0;

let popSize = 100;

let turn = 1;

let speedy = 1;

function setup() {
  createCanvas(400, 400);
  populationO = randomPop(popSize);
  populationX = randomPop(popSize);
  setUpGame();

  frameRate(7);
}

function draw() {
  for (let i = 0; i < (popSize-1) * speedy + 1; i++) {
    if (deadO.length < popSize) {
      if (winner() == 0) {
        //console.log("Playing " + ((turn == 1) ? "O" : "X"));
        makeMove(turn);
        turn *= -1;
        gameLen++;
      } else {

        if (winner() == 1) {
          deadO.push({brain : brainO, len : gameLen, won : 1, force : forcedWin});
          deadX.push({brain : brainX, len : gameLen, won : 0, force : undefined});
        } else {
          deadO.push({brain : brainO, len : gameLen, won : 0, force : undefined});
          deadX.push({brain : brainX, len : gameLen, won : 1, force : -1 * forcedWin});
        }

        if (forcedWin == 0) {
          goodGames++;
        }

        totalGames++;

        setUpGame();
      }
    } else {
      populationO = nextGen(deadO);
      populationX = nextGen(deadX);
      deadO = [];
      deadX = [];
      setUpGame();
      generations++;
    }
  }

  background(255);
  drawBoard();
}

function setUpGame() {
  game = emptyGame();
  gameLen = 0;
  turn = random([-1, 1]);
  forcedWin = 0;
  brainO = populationO.pop();
  brainX = populationX.pop();
}

function emptyGame() {
  return {
    0 : 0,
    1 : 0,
    2 : 0,
    3 : 0,
    4 : 0,
    5 : 0,
    6 : 0,
    7 : 0,
    8 : 0
  };
}

function drawBoard() {
  let span = 50;
  textSize(65);

  line(105, 0, 105, 200);
  line(170, 0, 170, 200);
  line(30, 60, 230, 60);
  line(30, 125, 230, 125);

  for (let i = 0; i <= 2; i++) {
    for (let j = 0; j <= 2; j++) {
      let cell = game[3 * j + i];
      let txt = (cell == 0) ? "" : ((cell == 1) ? "O" : "X");
      text(txt, 65 * i + span, 65 * j + span);
    }
  }

  textSize(32);
  text("Total Games: " + totalGames, 15, 300);
  text("Good Games: " + goodGames, 15, 350);
  text("Gen: " + generations, 15, 400);
}

function winner() {
  if (game[0] == game[1] && game[1] == game[2] && game[0] != 0) {
    return game[0];
  }

  if (game[3] == game[4] && game[4] == game[5] && game[3] != 0) {
    return game[3];
  }

  if (game[6] == game[7] && game[7] == game[8] && game[6] != 0) {
    return game[6];
  }

  if (game[0] == game[3] && game[3] == game[6] && game[0] != 0) {
    return game[0];
  }

  if (game[1] == game[4] && game[4] == game[4] && game[1] != 0) {
    return game[1];
  }

  if (game[2] == game[5] && game[5] == game[7] && game[2] != 0) {
    return game[2];
  }

  if (game[0] == game[4] && game[4] == game[8] && game[0] != 0) {
    return game[0];
  }

  if (game[2] == game[4] && game[4] == game[6] && game[2] != 0) {
    return game[2];
  }

  return forcedWin;
}

function randomPop(size) {
  let pop = []
  for (let i = 0; i < size; i++) {
    pop.push(new NeuralNetwork(9, 7, 9));
  }

  return pop;
}

function processData() {
  let res = [];
  for (let i = 0; i <= 8; i++) {
    res.push( (game[i] + 1) / 2 );
  }
  return res;
}

function makeMove(turn) {
  let brain = (turn == 1) ? brainO : brainX;
  let move = brain.predict(processData());
  let cell = move.indexOf(Math.max(...move));

  if (game[cell] != 0) {
    forcedWin = -1 * turn;
  } else {
    game[cell] = turn;
  }
}

function nextGen(prev) {
  let res = [];
  for (let i = 0; i < popSize; i++) {
    let newBorn = new NeuralNetwork(random(randomProb(prev)));
    newBorn.mutate((x) => x + phiRand() * Math.sqrt(1000));
    res.push(newBorn);
  }

  return res;
}

function phiRand() {
  let res = 0;
  for (let i = 0; i < 1000; i++) {
    res += random(-1, 1);
  }

  return res / 1000;
}

function randomProb(arr) {
  let res = [];
  for (e of arr) {
    let fittness = e.won * ((e.force == 1 ? e.len / 2 : e.len * 10) + 5);
    for (let i = 0; i < fittness; i++) {
      res.push(e.brain);
    }
  }
  return shuffle(res);
}
