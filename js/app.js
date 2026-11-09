
"use strict";

// =====================================
// PIE CHALLENGE - GAME ENGINE
// =====================================

const defaultState = {
    score: 0,
    completedLevels: [],
    correctQuestions: [],
    unlockedLevel: 1
};

function loadState() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("pieChallenge")
        );
        return saved
            ? { ...defaultState, ...saved }
            : { ...defaultState };
    } catch (error) {
        console.error(error);
        return { ...defaultState };
    }
}

let state = loadState();
let currentLevelIndex = 0;
let currentQuestionIndex = 0;
let currentQuestion = null;

let selectedLetters = [];
let selectedWords = [];
let selectedChoice = "";
let answered = false;
let hinted = false;

let activeCrosswordCell = null;
let crosswordGrid = [];
let crosswordWords = [];

// =====================================
// HELPERS
// =====================================

function saveState() {
    localStorage.setItem(
        "pieChallenge",
        JSON.stringify(state)
    );
}

function normalizeAnswer(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function shuffle(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(
            Math.random() * (i + 1)
        );
        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
}

function getQuestionId() {
    return `${currentLevelIndex}-${currentQuestionIndex}`;
}

function showFeedback(message, type = "") {
    const element = document.getElementById("feedback");
    element.textContent = message;
    element.className = `feedback ${type}`;
}

function updateHeader() {
    document.getElementById("headerScore").textContent =
        state.score;

    document.getElementById("headerLevel").textContent =
        `${state.completedLevels.length}/${levels.length}`;
}

// =====================================
// NAVIGATION
// =====================================

function showView(name) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });

    document.getElementById(
        `${name}View`
    )?.classList.add("active");

    if (name === "levels") renderLevels();
    if (name === "profile") renderProfile();

    updateHeader();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// =====================================
// LEVELS
// =====================================

function renderLevels() {
    const container =
        document.getElementById("levelsContainer");

    container.innerHTML = "";

    levels.forEach((level, index) => {
        const unlocked = index === 0 ||
            state.completedLevels.includes(index - 1);

        const completed =
            state.completedLevels.includes(index);

        const card = document.createElement("div");
        card.className =
            `level-card ${unlocked ? "" : "locked"}`;

        card.innerHTML = `
            <div class="level-icon">${level.icon}</div>
            <h3>Niveau ${level.id}</h3>
            <h4>${level.title}</h4>
            <p>${level.description}</p>
            <div class="level-status">
                ${completed ? "✅ Terminé" :
            unlocked ? "🔓 Disponible" :
                "🔒 Verrouillé"}
            </div>
            <button
                ${unlocked ? "" : "disabled"}
                onclick="startLevel(${index})">
                ${completed ? "Rejouer" :
            unlocked ? "Jouer" : "Verrouillé"}
            </button>
        `;

        container.appendChild(card);
    });
}


function startLevel(index) {
    const unlocked =
        index === 0 ||
        state.completedLevels.includes(index - 1);

    if (!unlocked) return;

    currentLevelIndex = index;
    currentQuestionIndex = 0;

    // Niveau 6 = PIE Magic Examination
    if (index === 5) {
        openPieLevel6();
        return;
    }

    // Other levels work normally
    renderQuestion();
    showView("game");
}

// =====================================
// QUESTIONS
// =====================================

function renderQuestion() {
    const level = levels[currentLevelIndex];
    currentQuestion =
        level.questions[currentQuestionIndex];

    selectedLetters = [];
    selectedWords = [];
    selectedChoice = "";
    answered = false;
    hinted = false;
    activeCrosswordCell = null;

    document.getElementById("levelTitle").textContent =
        `Niveau ${level.id} - ${level.title}`;

    document.getElementById("questionNumber").textContent =
        `Question ${currentQuestionIndex + 1}/${level.questions.length}`;

    document.getElementById("questionType").textContent =
        level.title.toUpperCase();

    document.getElementById("questionTitle").textContent =
        currentQuestion.question;

    document.getElementById("questionDescription").textContent =
        currentQuestion.description;

    showFeedback("");

    const hintBtn = document.getElementById("hintBtn");
    const checkBtn = document.getElementById("checkBtn");
    const nextBtn = document.getElementById("nextBtn");

    hintBtn.disabled = false;
    checkBtn.disabled = false;

    hintBtn.classList.remove("hidden");
    checkBtn.classList.remove("hidden");
    nextBtn.classList.add("hidden");

    document.getElementById("progressBar").style.width =
        `${(currentQuestionIndex + 1) /
        level.questions.length * 100}%`;

    renderGameMode(level.type);

    updateHeader();

    const card = document.querySelector(
        "#gameView .question-card"
    );

    if (card) {
        card.classList.remove("animate-question");
        void card.offsetWidth;
        card.classList.add("animate-question");
    }
}

// =====================================
// GAME MODES
// =====================================

function renderGameMode(type) {
    const content =
        document.getElementById("questionContent");

    const area =
        document.getElementById("answerArea");

    content.innerHTML = "";
    area.innerHTML = "";

    if (type === "image") {
        const image = currentQuestion.image;

        content.innerHTML = `
            <div class="game-picture">
                ${image
            ? `<img src="${image}"
                         class="question-image"
                         alt="Illustration">`
            : `<div class="image-placeholder">🏢</div>`}
            </div>
            <p class="mode-instruction">
                Observe l'image et trouve le mot.
            </p>
        `;
        createLetterGame(area);

    } else if (type === "scramble") {
        content.innerHTML = `
            <div class="game-picture">🔤</div>
            <p class="mode-instruction">
                Retrouve le mot avec les lettres.
            </p>
        `;
        createLetterGame(area);

    } else if (type === "order") {
        content.innerHTML = `
            <div class="game-picture">📝</div>
            <p class="mode-instruction">
                Mets les mots dans le bon ordre.
            </p>
        `;
        createWordGame(area);

    } else if (type === "crossword") {
        content.innerHTML = `
            <p class="mode-instruction">
                Complète la grille à partir des définitions.
            </p>
        `;
        createCrosswordGame(area);

    } else if (type === "odd") {
        content.innerHTML = `
            <div class="game-picture">🔍</div>
            <p class="mode-instruction">
                Choisis l'intrus.
            </p>
        `;
        createOddGame(area);

    } else if (type === "complete") {
        content.innerHTML = `
            <div class="game-picture">✍️</div>
            <p class="mode-instruction">
                Trouve le mot manquant.
            </p>
        `;
        createLetterGame(area);

    } else if (type === "mystery") {
        content.innerHTML = `
            <div class="game-picture">🔐</div>
            <p class="mode-instruction">
                Découvre le mot mystère.
            </p>
        `;
        createLetterGame(area);
    }
}

// =====================================
// LETTER GAME
// =====================================


function createLetterGame(container) {
    const answer = normalizeAnswer(currentQuestion.answer);
    const alphabet = "aaaaeeeiioouurrstlmnp";
    const letters = answer.split("");

    const extraCount = Math.max(8, 24 - letters.length);

    for (let i = 0; i < extraCount; i++) {
        letters.push(
            alphabet[Math.floor(Math.random() * alphabet.length)]
        );
    }

    // Reset selected letters for the new question
    selectedLetters = [];

    container.innerHTML = `
        <div class="answer-slots" id="answerSlots"></div>

        <div class="letter-game-center">
            <div class="letter-grid" id="letterGrid"></div>
        </div>

        <div class="letter-actions">
            <button class="secondary-btn"
                onclick="undoLetter()">⌫ Effacer</button>

            <button class="secondary-btn"
                onclick="clearLetters()">↻ Recommencer</button>
        </div>
    `;

    const grid = document.getElementById("letterGrid");

    shuffle(letters).forEach((letter, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "letter-tile";
        button.textContent = letter.toUpperCase();
        button.dataset.index = index;

        button.onclick = () => {
            if (answered || button.disabled) return;

            selectedLetters.push({ index, letter });
            button.disabled = true;

            updateAnswerSlots();
        };

        grid.appendChild(button);
    });

    updateAnswerSlots();
}

function updateAnswerSlots() {
    const slots = document.getElementById("answerSlots");
    if (!slots) return;

    slots.innerHTML = "";

    if (!selectedLetters.length) {
        slots.innerHTML =
            `<span class="slot-placeholder">
                Choisis les lettres...
             </span>`;
        return;
    }

    selectedLetters.forEach(item => {
        const slot = document.createElement("span");
        slot.className = "answer-letter";
        slot.textContent = item.letter.toUpperCase();
        slots.appendChild(slot);
    });
}

function undoLetter() {
    if (answered || !selectedLetters.length) return;

    const removed = selectedLetters.pop();

    const button = document.querySelector(
        `.letter-tile[data-index="${removed.index}"]`
    );

    if (button) button.disabled = false;
    updateAnswerSlots();
}

function clearLetters() {
    if (answered) return;

    selectedLetters = [];

    document.querySelectorAll(".letter-tile").forEach(
        button => button.disabled = false
    );

    updateAnswerSlots();
}

// =====================================
// CROSSWORD - REAL CONNECTED GRID
// =====================================

// These positions connect all four words.
// They are compatible with entrepreneurCrossword
// in questions.js.


/* =========================================
   CROSSWORD - WORD BY WORD
========================================= */

let crosswordPuzzle = null;
let crosswordSelectedWord = null;
let crosswordSolvedWords = new Set();
let crosswordCells = new Map();
let crosswordLayout = [];

// Generate connected crossword positions

function buildCrosswordLayout(words) {
    const placed = [];
    const occupied = new Map();

    const key = (r, c) => `${r},${c}`;

    function canPlace(word, row, col, direction) {
        const dr = direction === "vertical" ? 1 : 0;
        const dc = direction === "horizontal" ? 1 : 0;

        let intersections = 0;

        // Check cells before and after the word
        if (occupied.has(key(row - dr, col - dc))) return false;

        if (occupied.has(key(
            row + dr * word.length,
            col + dc * word.length
        ))) return false;

        for (let i = 0; i < word.length; i++) {
            const r = row + dr * i;
            const c = col + dc * i;

            const existing = occupied.get(key(r, c));

            if (existing !== undefined) {
                if (existing !== word[i]) return false;

                // Intersections must be perpendicular
                const crossing = placed.some(item => {
                    if (item.direction === direction) return false;

                    return getPositions(item).some(
                        p => p.row === r && p.col === c
                    );
                });

                if (!crossing) return false;

                intersections++;
            } else {
                // Prevent adjacent parallel words
                if (direction === "horizontal") {
                    if (occupied.has(key(r - 1, c))) return false;
                    if (occupied.has(key(r + 1, c))) return false;
                } else {
                    if (occupied.has(key(r, c - 1))) return false;
                    if (occupied.has(key(r, c + 1))) return false;
                }
            }
        }

        return intersections > 0;
    }

    function getPositions(item) {
        const result = [];

        for (let i = 0; i < item.word.length; i++) {
            result.push({
                row: item.row +
                    (item.direction === "vertical" ? i : 0),
                col: item.col +
                    (item.direction === "horizontal" ? i : 0)
            });
        }

        return result;
    }

    function place(item, row, col, direction) {
        const entry = {
            ...item,
            row,
            col,
            direction
        };

        placed.push(entry);

        getPositions(entry).forEach((position, i) => {
            occupied.set(
                key(position.row, position.col),
                item.word[i]
            );
        });
    }

    // Place first word horizontally
    place(words[0], 0, 0, "horizontal");

    for (let w = 1; w < words.length; w++) {
        const item = words[w];
        let found = null;

        // Try crossing every already placed word
        for (const previous of placed) {
            const direction =
                previous.direction === "horizontal"
                    ? "vertical"
                    : "horizontal";

            const previousPositions = getPositions(previous);

            for (let i = 0; i < item.word.length; i++) {
                for (let j = 0; j < previous.word.length; j++) {
                    if (item.word[i] !== previous.word[j]) {
                        continue;
                    }

                    const cross = previousPositions[j];

                    const row = cross.row -
                        (direction === "vertical" ? i : 0);

                    const col = cross.col -
                        (direction === "horizontal" ? i : 0);

                    if (canPlace(item.word, row, col, direction)) {
                        found = { row, col, direction };
                        break;
                    }
                }

                if (found) break;
            }

            if (found) break;
        }

        if (!found) {
            console.warn(
                "No valid intersection for:", item.word
            );

            // Safe fallback: place word separately
            const lowestRow = Math.max(
                ...placed.map(p =>
                    p.row +
                    (p.direction === "vertical"
                        ? p.word.length : 1)
                )
            );

            found = {
                row: lowestRow + 2,
                col: 0,
                direction: "horizontal"
            };
        }

        place(item, found.row, found.col, found.direction);
    }

    return placed;
}


// Render crossword

function createCrosswordGame(container) {
    crosswordPuzzle = entrepreneurCrosswords[currentQuestionIndex];

    crosswordSolvedWords = new Set();
    crosswordSelectedWord = null;
    crosswordCells = new Map();

    const words = crosswordPuzzle.words.map(item => ({
        ...item,
        word: normalizeAnswer(item.word).toUpperCase()
    }));

    // Validated crossword layouts
    const layouts = [
        [
            { id: 1, row: 0, col: 0, direction: "horizontal" },
            { id: 2, row: -6, col: 0, direction: "vertical" },
            { id: 3, row: -5, col: 0, direction: "horizontal" },
            { id: 4, row: -2, col: -1, direction: "horizontal" }
        ],
        [
            { id: 1, row: 0, col: 0, direction: "horizontal" },
            { id: 2, row: 3, col: 0, direction: "horizontal" },
            { id: 3, row: 5, col: 0, direction: "horizontal" },
            { id: 4, row: 0, col: 4, direction: "vertical" }
        ],
        [
            { id: 1, row: 0, col: 0, direction: "horizontal" },
            { id: 2, row: -5, col: 1, direction: "vertical" },
            { id: 3, row: -8, col: 4, direction: "vertical" },
            { id: 4, row: -7, col: 6, direction: "vertical" }
        ]
    ];

    const positions = layouts[currentQuestionIndex];

    if (!positions) {
        throw new Error("Crossword layout not found");
    }

    crosswordLayout = words.map(word => {
        const position = positions.find(p => p.id === word.id);

        if (!position) {
            throw new Error("Position missing: " + word.word);
        }

        return { ...word, ...position };
    });

    // Normalize coordinates
    const minRow = Math.min(...crosswordLayout.map(w => w.row));
    const minCol = Math.min(...crosswordLayout.map(w => w.col));

    crosswordLayout = crosswordLayout.map(word => ({
        ...word,
        row: word.row - minRow,
        col: word.col - minCol
    }));

    // Validate all intersections
    const occupied = new Map();

    crosswordLayout.forEach(word => {
        getWordPositions(word).forEach((position, index) => {
            const letter = word.word[index];

            if (
                occupied.has(position) &&
                occupied.get(position) !== letter
            ) {
                throw new Error(
                    "Crossword conflict at " + position
                );
            }

            occupied.set(position, letter);
        });
    });

    const maxRow = Math.max(
        ...crosswordLayout.map(word =>
            word.row +
            (word.direction === "vertical"
                ? word.word.length - 1 : 0)
        )
    );

    const maxCol = Math.max(
        ...crosswordLayout.map(word =>
            word.col +
            (word.direction === "horizontal"
                ? word.word.length - 1 : 0)
        )
    );

    container.innerHTML = `
        <div class="crossword-board">
            <h3>🧩 ${crosswordPuzzle.title}</h3>

            <p class="mode-instruction">
                Choisis une définition, écris le mot,
                puis clique sur Vérifier.
            </p>

            <div class="crossword-scroll">
                <div class="real-crossword-grid"
                     id="realCrosswordGrid"></div>
            </div>

            <div class="crossword-clues"
                 id="crosswordClues"></div>

            <div class="crossword-keyboard"
                 id="crosswordKeyboard"></div>

            <div class="letter-actions">
                <button class="secondary-btn"
                    onclick="eraseCrosswordLetter()">
                    ⌫ Effacer
                </button>

                <button class="secondary-btn"
                    onclick="clearCrosswordLetters()">
                    ↻ Recommencer le mot
                </button>
            </div>
        </div>
        <div class="crossword-progress">
    <div class="crossword-progress-info">
        <span>Progression</span>
        <strong id="crosswordProgressText">0 / 4 mots</strong>
    </div>

        <div class="crossword-progress-track">
            <div id="crosswordProgressFill"></div>
        </div>
    </div>
    `;

    const grid = document.getElementById("realCrosswordGrid");

    grid.style.gridTemplateColumns =
        `repeat(${maxCol + 1}, 34px)`;

    grid.style.gridTemplateRows =
        `repeat(${maxRow + 1}, 34px)`;

    grid.style.width = "max-content";
    grid.style.margin = "0 auto";

    // Build grid
    for (let row = 0; row <= maxRow; row++) {
        for (let col = 0; col <= maxCol; col++) {
            const position = `${row},${col}`;
            const cell = document.createElement("div");

            cell.className = "crossword-square";

            if (occupied.has(position)) {
                cell.classList.add("active");
                cell.dataset.position = position;
                cell.dataset.input = "";

                crosswordCells.set(position, cell);

                cell.onclick = () => {
                    const matching = crosswordLayout.find(word =>
                        !crosswordSolvedWords.has(word.id) &&
                        getWordPositions(word).includes(position)
                    );

                    if (matching) {
                        selectCrosswordWord(matching.id);
                    }
                };
            }

            grid.appendChild(cell);
        }
    }

    // Clues
    const clues = document.getElementById("crosswordClues");

    crosswordLayout.forEach(word => {
        const button = document.createElement("button");

        button.className = "secondary-btn";
        button.textContent = `${word.id}. ${word.clue}`;

        button.onclick = () => selectCrosswordWord(word.id);

        clues.appendChild(button);
    });

    // Keyboard
    const keyboard = document.getElementById("crosswordKeyboard");

    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter => {
        const button = document.createElement("button");

        button.className = "crossword-key";
        button.textContent = letter;

        button.onclick = () => enterCrosswordLetter(letter);

        keyboard.appendChild(button);
    });

    selectCrosswordWord(crosswordLayout[0].id);
}

function updateCrosswordProgress() {
    const total = crosswordLayout.length;
    const solved = crosswordSolvedWords.size;

    const progressText = document.getElementById(
        "crosswordProgressText"
    );

    const progressFill = document.getElementById(
        "crosswordProgressFill"
    );

    if (!progressText || !progressFill || total === 0) {
        return;
    }

    progressText.textContent = `${solved} / ${total} mots`;
    progressFill.style.width = `${(solved / total) * 100}%`;
}

// Positions occupied by a word
function getWordPositions(word) {
    const positions = [];

    for (let i = 0; i < word.word.length; i++) {
        const row = word.row +
            (word.direction === "vertical" ? i : 0);

        const col = word.col +
            (word.direction === "horizontal" ? i : 0);

        positions.push(`${row},${col}`);
    }

    return positions;
}

// Select a word


function selectCrosswordWord(id) {
    if (answered || crosswordSolvedWords.has(id)) {
        return;
    }

    const word = crosswordLayout.find(
        item => item.id === id
    );

    if (!word) return;

    // Keep all previously entered letters
    crosswordSelectedWord = word;

    // Refresh selection without deleting inputs
    updateCrosswordDisplay();
}

// Enter a letter

function enterCrosswordLetter(letter) {
    if (answered || !crosswordSelectedWord) return;

    const positions = getWordPositions(crosswordSelectedWord);

    for (const position of positions) {
        const cell = crosswordCells.get(position);

        if (!cell) continue;

        // Never overwrite a validated letter
        if (cell.dataset.locked === "true") {
            continue;
        }

        // Fill the next empty cell
        if (!cell.dataset.input) {
            cell.dataset.input = letter.toUpperCase();
            updateCrosswordDisplay();
            return;
        }
    }
}

// Erase last unlocked letter
function eraseCrosswordLetter() {
    if (answered || !crosswordSelectedWord) return;

    const positions =
        getWordPositions(crosswordSelectedWord).reverse();

    for (const position of positions) {
        const cell = crosswordCells.get(position);

        if (!cell.dataset.locked &&
            cell.dataset.input) {
            cell.dataset.input = "";
            updateCrosswordDisplay();
            return;
        }
    }
}

// Clear selected word
function clearCrosswordLetters() {
    if (answered || !crosswordSelectedWord) return;

    getWordPositions(crosswordSelectedWord).forEach(position => {
        const cell = crosswordCells.get(position);

        if (!cell.dataset.locked) {
            cell.dataset.input = "";
        }
    });

    updateCrosswordDisplay();
}

// Refresh colors and letters
function updateCrosswordDisplay() {
    crosswordCells.forEach(cell => {
        cell.textContent = cell.dataset.input || "";

        cell.classList.remove(
            "selected",
            "correct",
            "incorrect",
            "filled"
        );

        if (cell.dataset.locked) {
            cell.classList.add("correct");
        } else if (cell.dataset.input) {
            cell.classList.add("filled");
        }
    });

    if (crosswordSelectedWord) {
        getWordPositions(crosswordSelectedWord)
            .forEach(position => {
                const cell = crosswordCells.get(position);

                if (!cell.dataset.locked) {
                    cell.classList.add("selected");
                }
            });
    }

    document.querySelectorAll(
        "#crosswordClues button"
    ).forEach((button, index) => {
        const word = crosswordLayout[index];

        button.disabled =
            crosswordSolvedWords.has(word.id);

        button.textContent =
            crosswordSolvedWords.has(word.id)
                ? `✅ ${word.word}`
                : `${word.id}. ${word.clue}`;
    });
}

// Verify selected word
function checkCrosswordAnswer() {
    if (!crosswordSelectedWord) {
        showFeedback(
            "Choisis une définition.",
            "error"
        );
        return;
    }

    const word = crosswordSelectedWord;

    const answer = getWordPositions(word)
        .map(position =>
            crosswordCells.get(position).dataset.input || ""
        )
        .join("");

    if (answer !== word.word) {
        showFeedback(
            "❌ Mot incorrect. Essaie encore.",
            "error"
        );
        return;
    }

    crosswordSolvedWords.add(word.id);
    updateCrosswordProgress();
    getWordPositions(word).forEach(position => {
        const cell = crosswordCells.get(position);
        cell.dataset.locked = "true";
    });

    showFeedback(
        `✅ ${word.word} ! Mot trouvé.`,
        "success"
    );

    crosswordSelectedWord = null;

    if (crosswordSolvedWords.size === crosswordLayout.length) {
        handleCorrectAnswer();
        return;
    }

    updateCrosswordDisplay();

    const next = crosswordLayout.find(
        item => !crosswordSolvedWords.has(item.id)
    );

    if (next) {
        selectCrosswordWord(next.id);
    }
}

// =====================================
// WORD ORDER
// =====================================

function createWordGame(container) {
    const words = currentQuestion.description
        .split("/")
        .map(word => word.trim());

    const options = shuffle(
        words.map((word, id) => ({ id, word }))
    );

    container.innerHTML = `
        <div class="word-answer-area">
            <strong>Ta phrase :</strong>
            <div id="selectedWords"
                 class="word-options"></div>
        </div>

        <div id="wordOptions"
             class="word-options"></div>

        <button class="secondary-btn"
            onclick="clearWords()">
            ↻ Recommencer
        </button>
    `;

    const parent = document.getElementById("wordOptions");

    options.forEach(item => {
        const button = document.createElement("button");
        button.className = "word-chip";
        button.textContent = item.word;
        button.dataset.id = item.id;

        button.onclick = () => {
            if (answered || button.disabled) return;

            selectedWords.push(item);
            refreshWordButtons();
            updateWordSlots();
        };

        parent.appendChild(button);
    });

    updateWordSlots();
}

function updateWordSlots() {
    const container =
        document.getElementById("selectedWords");

    container.innerHTML = "";

    selectedWords.forEach((item, index) => {
        const button = document.createElement("button");
        button.className = "word-chip selected-word";
        button.textContent = item.word;

        button.onclick = () => {
            if (answered) return;
            selectedWords.splice(index, 1);
            refreshWordButtons();
            updateWordSlots();
        };

        container.appendChild(button);
    });
}

function refreshWordButtons() {
    const used = selectedWords.map(item => item.id);

    document.querySelectorAll(
        "#wordOptions .word-chip"
    ).forEach(button => {
        button.disabled =
            used.includes(Number(button.dataset.id));
    });
}

function clearWords() {
    if (answered) return;

    selectedWords = [];
    refreshWordButtons();
    updateWordSlots();
}

// =====================================
// FIND THE ODD ONE
// =====================================


function createOddGame(container) {

    const choices = shuffle(
        [...currentQuestion.options]
    );

    container.innerHTML = `
        <div class="odd-options" id="oddOptions"></div>
    `;

    const options = document.getElementById("oddOptions");

    choices.forEach(word => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "odd-option";
        button.textContent = word;

        button.onclick = () => {
            if (answered) return;

            selectedChoice = word;

            options.querySelectorAll(".odd-option")
                .forEach(item => {
                    item.classList.remove("odd-selected");
                });

            button.classList.add("odd-selected");
        };

        options.appendChild(button);
    });
}

// =====================================
// VERIFY ANSWER
// =====================================

function checkAnswer() {
    if (answered) return;

    const type = levels[currentLevelIndex].type;

    if (type === "crossword") {
        checkCrosswordAnswer();
        return;
    }

    let userAnswer = "";

    if (type === "order") {
        userAnswer = selectedWords
            .map(item => item.word)
            .join(" ");
    } else if (type === "odd") {
        userAnswer = selectedChoice;
    } else {
        userAnswer = selectedLetters
            .map(item => item.letter)
            .join("");
    }

    if (!userAnswer) {
        showFeedback(
            "Choisis une réponse avant de vérifier.",
            "error"
        );
        return;
    }

    if (normalizeAnswer(userAnswer) ===
        normalizeAnswer(currentQuestion.answer)) {
        handleCorrectAnswer();
    } else {
        showFeedback(
            "❌ Mauvaise réponse ! Essaie encore.",
            "error"
        );
    }
}

// =====================================
// CORRECT ANSWER
// =====================================

function handleCorrectAnswer() {
    answered = true;

    const id = getQuestionId();
    const firstTime =
        !state.correctQuestions.includes(id);

    if (firstTime) {
        state.correctQuestions.push(id);
        state.score += 100;

        showFeedback(
            "🎉 Bravo ! Bonne réponse ! +100 points",
            "success"
        );
    } else {
        showFeedback(
            "🎉 Bonne réponse ! Déjà validée.",
            "success"
        );
    }

    saveState();
    updateHeader();

    document.getElementById("checkBtn")
        .classList.add("hidden");

    document.getElementById("hintBtn")
        .classList.add("hidden");

    const next = document.getElementById("nextBtn");
    next.classList.remove("hidden");

    const total =
        levels[currentLevelIndex].questions.length;

    next.textContent =
        currentQuestionIndex === total - 1
            ? "Terminer le niveau 🏆"
            : "Question suivante →";

    document.querySelectorAll(
        ".letter-tile, .word-chip, .odd-option, .crossword-key"
    ).forEach(button => {
        if ("disabled" in button) {
            button.disabled = true;
        }
    });
}

// =====================================
// HINT
// =====================================

function useHint() {
    if (hinted || answered) return;

    hinted = true;
    state.score = Math.max(0, state.score - 20);

    saveState();
    updateHeader();

    showFeedback(
        `💡 Indice : ${currentQuestion.hint}`,
        "success"
    );

    document.getElementById("hintBtn").disabled = true;
}

// =====================================
// NEXT QUESTION
// =====================================

function nextQuestion() {
    if (!answered) return;

    const total =
        levels[currentLevelIndex].questions.length;

    if (currentQuestionIndex < total - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        finishLevel();
    }
}

// =====================================
// FINISH LEVEL
// =====================================

function finishLevel() {
    if (!state.completedLevels.includes(
        currentLevelIndex
    )) {
        state.completedLevels.push(currentLevelIndex);
    }

    state.unlockedLevel = Math.max(
        state.unlockedLevel,
        Math.min(
            levels.length,
            currentLevelIndex + 2
        )
    );

    saveState();

    const last =
        currentLevelIndex === levels.length - 1;

    document.getElementById("resultTitle").textContent =
        last ? "Félicitations ! 🏆" : "Niveau terminé !";

    document.getElementById("resultMessage").textContent =
        last
            ? "Tu as terminé tous les niveaux !"
            : "Bravo ! Tu as débloqué le niveau suivant.";

    document.getElementById("resultScore").textContent =
        state.score;

    document.getElementById("nextLevelBtn").textContent =
        last ? "Rejouer le niveau 1" : "Niveau suivant →";

    showView("results");
}

function goNextLevel() {
    if (currentLevelIndex === levels.length - 1) {
        startLevel(0);
    } else {
        startLevel(currentLevelIndex + 1);
    }
}

// =====================================
// PROFILE
// =====================================

function renderProfile() {
    document.getElementById("profileScore").textContent =
        state.score;

    document.getElementById("profileLevels").textContent =
        `${state.completedLevels.length}/${levels.length}`;

    document.getElementById("profileQuestions").textContent =
        `${state.correctQuestions.length}/${
            levels.reduce(
                (sum, level) => sum + level.questions.length,
                0
            )
        }`;
}

// =====================================
// RESET
// =====================================

function resetProgress() {
    if (!confirm("Supprimer toute ta progression ?")) {
        return;
    }

    state = {
        ...defaultState,
        completedLevels: [],
        correctQuestions: []
    };

    saveState();
    updateHeader();
    renderProfile();
    showView("levels");
}

// =====================================
// START
// =====================================

function initializeGame() {
    updateHeader();
    renderLevels();
}

initializeGame();

function openPieLevel6() {

    let examView = document.getElementById("examView");

    if (!examView) {

        examView = document.createElement("section");
        examView.id = "examView";
        examView.className = "view";

        examView.innerHTML = `
            <div style="text-align:center; padding:15px 0;">

                <button
                    onclick="showView('levels')"
                    style="
                        background:#7752c7;
                        color:white;
                        border:0;
                        padding:12px 22px;
                        border-radius:10px;
                        margin-bottom:20px;
                        cursor:pointer;
                    ">
                    ← Retour aux niveaux
                </button>

                <iframe
                    id="pieLevel6Frame"
                    title="PIE Magic Examination"
                    style="
                        width:100%;
                        height:85vh;
                        min-height:650px;
                        border:0;
                        border-radius:12px;
                    ">
                </iframe>

            </div>
        `;

        document.getElementById("levelsView")
            .parentElement.appendChild(examView);
    }

    showView("exam");

    // Reload the examination for a new attempt
    document.getElementById("pieLevel6Frame").src =
        "dencing words(pie niveau 6).html";
}


// ======================================
// EXAM COMPLETION - LEVEL 6
// ======================================

window.addEventListener("message", function(event) {

    const frame = document.getElementById("pieLevel6Frame");
    const view = document.getElementById("examView");

    if (!frame || !view) return;

    if (event.source !== frame.contentWindow) return;

    if (event.data?.type !== "PIE_LEVEL_6_COMPLETED") {
        return;
    }

    if (currentLevelIndex !== 5) return;
    if (!view.classList.contains("active")) return;

    // Keep the existing scoring system:
    // 3 questions x 100 points = 300 points
    for (let i = 0; i < 3; i++) {

        const questionId = `5-${i}`;

        if (!state.correctQuestions.includes(questionId)) {
            state.correctQuestions.push(questionId);
            state.score += 100;
        }
    }

    // Unlock level 7 using the existing system
    finishLevel();
});
