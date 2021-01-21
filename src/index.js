const axios = require('axios');
const apiUrl = "http://localhost:3000/scores";

import './style.scss';

class Game {
  constructor() {
    // On recupere les screens
    this.loadScreen = document.getElementById('load-screen');
    this.baseScreen = document.getElementById('base-screen');
    this.gameScreen = document.getElementById('game-screen');
    this.endScreen = document.getElementById('end-screen');

    // Buttons & Elements
    this.timeSpan = document.getElementById('time-span');
    this.startButton = document.getElementById('start');
    this.scoreOne = document.getElementById('score-one');
    this.scoreTwo = document.getElementById('score-two');
    this.scoreThree = document.getElementById('score-three');
    this.scoreFinal = document.getElementById('score-final');
    this.playernameInput = document.getElementById('playername');
    this.sendScoreBtn = document.getElementById('send-score-btn')
    
    // On recupere tous les cartes et on rempli un Array
    this.cardsContainer = document.querySelector('.card-box');
    this.cards = Array.from(this.cardsContainer.children);

    // Variables utiles
    this.duree = 1000;
    this.timer = 0;
    this.interval;

    this.shuffle()
    this.getBestScores()
  }

  getBestScores() {
    // Chargement des données & affichage du Loading Screen
    this.loadScreen.style.display = 'flex';

    axios.get(apiUrl)
    .then(response => {
      this.scoreOne.innerHTML = `${response.data[0].playername} - ${response.data[0].score} sec.`;
      this.scoreTwo.innerHTML = `${response.data[1].playername} - ${response.data[1].score} sec.`;
      this.scoreThree.innerHTML = `${response.data[2].playername} - ${response.data[2].score} sec.`;

      // Data injecté, hide du Loading Screen
      this.loadScreen.style.display = 'none';
    })
    .catch(err => alert(`Erreur: ${err}`))
  }

  submitScore() {
    // Check if empty
    if(this.playernameInput.value.length === 0) {
      alert('Enter your name please...')
    } else {
      // Send playername et Score
      axios.post(apiUrl, {playername: this.playernameInput.value, score: this.timer})
      .then(() => {

        // On melange et on charge les nouvelles data
        this.shuffle()
        this.getBestScores()

        // On affiche le base Screen
        this.baseScreen.style.display = 'flex';
        this.endScreen.style.display = 'none';
      })
      .catch(err => alert(`Erreur: ${err}`))
    }
  }

  shuffle() {
    // On modifie le order de chaque carte pour le mélange
    this.cards.forEach(card => {
			const randomNumber = Math.floor(Math.random() * this.cards.length) + 1;
			card.classList.remove('match');
			card.style.order = `${randomNumber}`;
		})
  }

  // On modifie les cartes pour eviter le click sur plusieurs cartes
  disableCard() {
    this.cardsContainer.classList.add('disable-event');

    setTimeout(() => {
      this.cardsContainer.classList.remove('disable-event');
    }, this.duree)
  }

  // Retourne la carte
  flip(clickedCard) {
    // On ajoute la class 'flipped' pour l'animation
    clickedCard.classList.add('flipped');
    // On recupere les cartes qui ont pour class 'flipped'
    const flipCard = this.cards.filter(card => card.classList.contains('flipped'));

    if(flipCard.length === 2) {
      // On désactive les autres cartes
      this.disableCard()
      // On verifie si les cartes match ! (Array)
      this.checkIfMatch(flipCard)
    }
  }

  // Verifie si les cartes sont identiques (dataset.value)
  checkIfMatch([cardOne, cardTwo]) {
    
    if(cardOne.dataset.value === cardTwo.dataset.value) {
      // Match : enleve la class 'flipped' et ajoute la class 'match'
      setTimeout(() => {
        cardOne.classList.remove('flipped');
        cardTwo.classList.remove('flipped');
        cardOne.classList.add('match');
        cardTwo.classList.add('match');

        this.isFinished()
      }, this.duree / 2)
    } else {
      // !Match : enleve la class 'flipped'
      setTimeout(() => {
        cardOne.classList.remove('flipped');
        cardTwo.classList.remove('flipped');
      }, this.duree)
    }
  }

  // on verifie si toutes la cartes contiennent la class 'match' afin de terminer le jeu
  isFinished() {
    if(this.cards.every(card => card.classList.contains('match'))) {
      clearInterval(this.interval);
      this.scoreFinal.innerHTML = this.timer;
      this.endScreen.style.display = 'flex';
      this.gameScreen.style.display = 'none';
    }
  }

  // On lance le timer et on incrémente de 1 sec
  startGame() {
    this.baseScreen.style.display = 'none';
    this.endScreen.style.display = 'none';
    this.gameScreen.style.display = 'block';

    this.interval = setInterval(() => {
      this.timer += 1;
      this.timeSpan.innerHTML = this.timer;
    }, 1000)
  }

}

const game = new Game()

// Création d'un listener pour chaque carte (cards<Array>)
game.cards.forEach(card => {
  card.addEventListener('click', game.flip.bind(game, card));
})

game.startButton.addEventListener('click', game.startGame.bind(game))
game.sendScoreBtn.addEventListener('click', game.submitScore.bind(game))
