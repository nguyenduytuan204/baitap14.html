// ===== Game State =====
const gameState = {
    cards: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    gameStarted: false,
    timer: null,
    seconds: 0,
    lockBoard: false
};

// ===== DOM Elements =====
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const timeDisplay = document.getElementById('time');
const resetBtn = document.getElementById('resetBtn');
const victoryModal = document.getElementById('victoryModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');

// ===== Initialize Game =====
function initGame() {
    resetGameState();
    const shuffledCards = shuffleCards([...gameState.cards, ...gameState.cards]);
    renderCards(shuffledCards);
}

// ===== Reset Game State =====
function resetGameState() {
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.gameStarted = false;
    gameState.seconds = 0;
    gameState.lockBoard = false;
    
    clearInterval(gameState.timer);
    
    updateStats();
    hideModal();
}

// ===== Shuffle Cards (Fisher-Yates Algorithm) =====
function shuffleCards(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ===== Render Cards =====
function renderCards(cards) {
    gameBoard.innerHTML = '';
    
    cards.forEach((emoji, index) => {
        const card = createCard(emoji, index);
        gameBoard.appendChild(card);
    });
}

// ===== Create Card Element =====
function createCard(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Memory card');
    
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-back"></div>
            <div class="card-front">${emoji}</div>
        </div>
    `;
    
    card.addEventListener('click', () => handleCardClick(card));
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(card);
        }
    });
    
    return card;
}

// ===== Handle Card Click =====
function handleCardClick(card) {
    // Prevent interactions when board is locked or card is already flipped/matched
    if (gameState.lockBoard || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched')) {
        return;
    }
    
    // Start timer on first click
    if (!gameState.gameStarted) {
        startTimer();
        gameState.gameStarted = true;
    }
    
    // Flip the card
    flipCard(card);
    
    // Add to flipped cards array
    gameState.flippedCards.push(card);
    
    // Check for match when two cards are flipped
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateStats();
        checkMatch();
    }
}

// ===== Flip Card =====
function flipCard(card) {
    card.classList.add('flipped');
    
    // Play flip sound (optional - can be added later)
    playSound('flip');
}

// ===== Check Match =====
function checkMatch() {
    gameState.lockBoard = true;
    
    const [card1, card2] = gameState.flippedCards;
    const emoji1 = card1.dataset.emoji;
    const emoji2 = card2.dataset.emoji;
    
    if (emoji1 === emoji2) {
        handleMatch(card1, card2);
    } else {
        handleMismatch(card1, card2);
    }
}

// ===== Handle Match =====
function handleMatch(card1, card2) {
    setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        gameState.matchedPairs++;
        updateStats();
        
        playSound('match');
        
        resetFlippedCards();
        
        // Check for victory
        if (gameState.matchedPairs === gameState.cards.length) {
            handleVictory();
        }
    }, 600);
}

// ===== Handle Mismatch =====
function handleMismatch(card1, card2) {
    setTimeout(() => {
        card1.classList.add('wrong');
        card2.classList.add('wrong');
        
        playSound('wrong');
        
        setTimeout(() => {
            card1.classList.remove('flipped', 'wrong');
            card2.classList.remove('flipped', 'wrong');
            
            resetFlippedCards();
        }, 500);
    }, 1000);
}

// ===== Reset Flipped Cards =====
function resetFlippedCards() {
    gameState.flippedCards = [];
    gameState.lockBoard = false;
}

// ===== Update Stats Display =====
function updateStats() {
    movesDisplay.textContent = gameState.moves;
    pairsDisplay.textContent = `${gameState.matchedPairs}/${gameState.cards.length}`;
}

// ===== Timer Functions =====
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.seconds++;
        updateTimeDisplay();
    }, 1000);
}

function updateTimeDisplay() {
    const minutes = Math.floor(gameState.seconds / 60);
    const seconds = gameState.seconds % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ===== Handle Victory =====
function handleVictory() {
    clearInterval(gameState.timer);
    
    // Add confetti effect
    createConfetti();
    
    setTimeout(() => {
        finalMoves.textContent = gameState.moves;
        finalTime.textContent = timeDisplay.textContent;
        showModal();
        
        playSound('victory');
    }, 800);
}

// ===== Modal Functions =====
function showModal() {
    victoryModal.classList.add('active');
    victoryModal.setAttribute('aria-hidden', 'false');
    playAgainBtn.focus();
}

function hideModal() {
    victoryModal.classList.remove('active');
    victoryModal.setAttribute('aria-hidden', 'true');
}

// ===== Confetti Effect =====
function createConfetti() {
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { 
                transform: 'translateY(0) rotate(0deg)',
                opacity: 1 
            },
            { 
                transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`,
                opacity: 0 
            }
        ], {
            duration: 2000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// ===== Sound Effects (Simple beep sounds using Web Audio API) =====
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'flip':
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'match':
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.15;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'wrong':
                oscillator.frequency.value = 200;
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
            case 'victory':
                // Play a victory melody
                const frequencies = [523, 659, 784, 1047];
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.value = freq;
                        gain.gain.value = 0.2;
                        osc.start();
                        osc.stop(audioContext.currentTime + 0.3);
                    }, index * 150);
                });
                break;
        }
    } catch (e) {
        // Audio not supported, silently fail
        console.log('Audio not supported');
    }
}

// ===== Event Listeners =====
resetBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Close modal on outside click
victoryModal.addEventListener('click', (e) => {
    if (e.target === victoryModal) {
        hideModal();
    }
});

// Keyboard support for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && victoryModal.classList.contains('active')) {
        hideModal();
    }
});

// ===== Initialize Game on Load =====
document.addEventListener('DOMContentLoaded', initGame);
