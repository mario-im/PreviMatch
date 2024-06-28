document.addEventListener('DOMContentLoaded', () => {
    let questionElement = document.getElementById('question');
    let scoreElement = document.getElementById('score');
    let timerElement = document.getElementById('timer');
    let cardElement = document.getElementById('card');
    const gameContainer = document.querySelector('.game-container');
    let score = 0;
    let timer = 7;
    let timerInterval;
    let level = 1;
    let maxScore = 0;
    let questions = [];
    let levels = [];

    fetch('https://raw.githubusercontent.com/mario-im/PreviMatch/main/questions.json')
        .then(response => response.json())
        .then(data => {
            levels = data.levels;
            loadLevel(level);
        })
        .catch(error => console.error('Errore nel caricamento delle domande:', error));

    function initializeSwipe(cardElement) {
        const hammer = new Hammer(cardElement);
        hammer.on('swipeleft swiperight', (event) => {
            handleSwipe(event);
        });
    }

    function loadLevel(lvl) {
        const currentLevel = levels.find(l => l.level === lvl);
        if (currentLevel) {
            questions = currentLevel.questions;
            maxScore = currentLevel.maxScore;
            score = 0;
            updateScoreDisplay();
            loadNewQuestion();
        }
    }

    function loadNewQuestion() {
        if (questions.length > 0) {
            let randomIndex = Math.floor(Math.random() * questions.length);
            let currentQuestion = questions[randomIndex];
            questionElement.textContent = currentQuestion.question;
            startTimer();
            cardElement.dataset.correct = currentQuestion.correct;
            cardElement.dataset.points = currentQuestion.points;
            cardElement.dataset.penalty = currentQuestion.penalty;
        } else {
            questionElement.textContent = 'Non ci sono più domande';
        }
    }

    function handleSwipe(event) {
        clearTimeout(timerInterval);
        let currentQuestion = {
            correct: JSON.parse(cardElement.dataset.correct),
            points: parseInt(cardElement.dataset.points),
            penalty: parseInt(cardElement.dataset.penalty)
        };
        let isCorrect = (event.type === 'swiperight' && currentQuestion.correct) ||
                        (event.type === 'swipeleft' && !currentQuestion.correct);
        if (isCorrect) {
            score += currentQuestion.points;
            cardElement.style.backgroundColor = 'green';
        } else {
            score -= currentQuestion.penalty;
            cardElement.style.backgroundColor = 'red';
        }
        updateScoreDisplay();

        // Controllare se il punteggio massimo è stato raggiunto
        if (score >= maxScore) {
            endGame();
        } else {
            // Aggiungere le classi di animazione
            if (event.type === 'swiperight') {
                cardElement.classList.add('swipe-right');
            } else if (event.type === 'swipeleft') {
                cardElement.classList.add('swipe-left');
            }

            setTimeout(() => {
                cardElement.style.backgroundColor = 'white';
                cardElement.classList.remove('swipe-right', 'swipe-left'); // Rimuovere le classi di animazione
                loadNewQuestion();
            }, 500); // Durata dell'animazione
        }
    }

    function startTimer() {
        timer = 7;
        timerElement.textContent = timer;
        clearInterval(timerInterval); // Assicurarsi di non avere più intervalli attivi
        timerInterval = setInterval(() => {
            if (timer > 0) {
                timer--;
                timerElement.textContent = timer;
            } else {
                clearInterval(timerInterval);
                score -= 1; // Penalità se non si risponde in tempo, con possibilità di punteggio negativo
                updateScoreDisplay();
                loadNewQuestion();
            }
        }, 1000);
    }

    function endGame() {
        clearTimeout(timerInterval);
        let endMessage = '';
        if (level >= levels.length) {
            endMessage = 'Complimenti! Hai completato tutti i livelli!';
        } else {
            endMessage = 'Complimenti! Hai completato questo livello!';
        }
        gameContainer.innerHTML = `
            <div class="victory-message">
                <img id="trophy" src="https://gallery.yopriceville.com/var/albums/Free-Clipart-Pictures/Trophy-and-Medals-PNG/Golden_Cup_Trophy_PNG_Transparent_Clipart.png" alt="Trophy" class="trophy">
                <h1>${endMessage}</h1>
                ${level < levels.length ? '<button id="next-level">Avanza al prossimo livello</button>' : ''}
            </div>
            <div class="confetti"></div>
        `;
        showConfetti();
        if (level < levels.length) {
            document.getElementById('next-level').addEventListener('click', nextLevel);
        } else {
            document.getElementById('trophy').addEventListener('click', resetGame);
        }
    }

    function nextLevel() {
        level++;
        if (level <= levels.length) {
            loadLevel(level);
            gameContainer.innerHTML = `
                <div class="card" id="card">
                    <div class="card-content">
                        <p id="question">Caricamento domanda...</p>
                    </div>
                </div>
                <div class="score-container">
                    <p id="score">Punti: 0 / ${maxScore}</p>
                </div>
                <div class="timer-container">
                    <p id="timer">7</p>
                </div>
            `;

            questionElement = document.getElementById('question');
            scoreElement = document.getElementById('score');
            timerElement = document.getElementById('timer');
            cardElement = document.getElementById('card');

            initializeSwipe(cardElement);
            loadNewQuestion();
        } else {
            // Fine del gioco
            gameContainer.innerHTML = `
                <div class="victory-message">
                    <img id="trophy" src="path/to/trophy.png" alt="Trophy" class="trophy">
                    <h1>Complimenti! Hai completato tutti i livelli!</h1>
                </div>
            `;
            document.getElementById('trophy').addEventListener('click', resetGame);
        }
    }

    function updateScoreDisplay() {
        scoreElement.textContent = `Punti: ${score} / ${maxScore}`;
    }

    function showConfetti() {
        const confettiContainer = document.querySelector('.confetti');
        confettiContainer.style.position = 'absolute';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.innerHTML = ''; // Pulire il contenuto precedente
        for (let i = 0; i < 100; i++) {
            const confetto = document.createElement('div');
            confetto.classList.add('confetto');
            confetto.style.left = Math.random() * 100 + 'vw';
            confetto.style.animationDuration = Math.random() * 3 + 2 + 's';
            confettiContainer.appendChild(confetto);
        }
    }

    function resetGame() {
        level = 1;
        loadLevel(level);
        gameContainer.innerHTML = `
            <div class="card" id="card">
                <div class="card-content">
                    <p id="question">Caricamento domanda...</p>
                </div>
            </div>
            <div class="score-container">
                <p id="score">Punti: 0 / ${maxScore}</p>
            </div>
            <div class="timer-container">
                <p id="timer">7</p>
            </div>
        `;
        questionElement = document.getElementById('question');
        scoreElement = document.getElementById('score');
        timerElement = document.getElementById('timer');
        cardElement = document.getElementById('card');
        initializeSwipe(cardElement);
        loadNewQuestion();
    }

    initializeSwipe(cardElement);
    loadNewQuestion();
});